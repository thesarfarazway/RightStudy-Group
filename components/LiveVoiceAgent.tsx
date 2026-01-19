import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, X, Activity, AlertCircle } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../utils/audio';

interface LiveVoiceAgentProps {
  onClose: () => void;
}

const LiveVoiceAgent: React.FC<LiveVoiceAgentProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error' | 'permission-denied'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  
  // Refs for audio handling to avoid re-renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const inputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Visualizer ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  const startSession = async () => {
    if (!process.env.API_KEY) {
      console.error("API Key missing");
      setStatus('error');
      return;
    }

    try {
      setStatus('connecting');
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Setup Audio Output
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);
      
      // Setup Audio Input
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      inputContextRef.current = inputCtx;
      
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        console.error("Microphone permission denied:", err);
        setStatus('permission-denied');
        return;
      }
      
      streamRef.current = stream;

      // Setup Visualizer
      const analyser = inputCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      const sourceVisual = inputCtx.createMediaStreamSource(stream);
      sourceVisual.connect(analyser);
      drawVisualizer();

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are a friendly, conversational tutor for RightStudy. You help students understand complex topics in Safety Management, Fire Safety, and Science. You are encouraging, patient, and speak clearly. Keep responses relatively short and conversational.',
        },
        callbacks: {
          onopen: () => {
            console.log('Live session opened');
            setStatus('connected');
            setIsActive(true);

            // Setup Input Processing
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return; // Don't send if muted
              
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                  session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
                const ctx = audioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                try {
                    const audioBuffer = await decodeAudioData(
                        decode(base64Audio),
                        ctx,
                        24000,
                        1
                    );
                    
                    const source = ctx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputNode); // connect to gain node
                    
                    source.addEventListener('ended', () => {
                        sourcesRef.current.delete(source);
                    });

                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                    sourcesRef.current.add(source);
                } catch (err) {
                    console.error("Audio decode error", err);
                }
            }

            // Handle Interruption
            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
                console.log("Interrupted");
                sourcesRef.current.forEach(src => {
                    try { src.stop(); } catch(e) {}
                });
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            console.log('Session closed');
            setStatus('idle');
            setIsActive(false);
          },
          onerror: (err) => {
            console.error('Session error', err);
            setStatus('error');
          }
        }
      });

    } catch (e) {
      console.error("Failed to start session", e);
      setStatus('error');
    }
  };

  const stopSession = () => {
    // Clean up Audio Contexts
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    if (inputContextRef.current) {
        inputContextRef.current.close();
        inputContextRef.current = null;
    }
    // Stop Stream
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    // Clear sources
    sourcesRef.current.forEach(src => {
        try { src.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();

    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
    }

    setIsActive(false);
    setStatus('idle');
  };

  const drawVisualizer = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(255, 255, 255)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for(let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        ctx.fillStyle = `rgb(79, 70, 229)`; // Indigo-600
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white text-center">
      <div className="mb-6">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
             {status === 'connected' && (
               <span className="absolute top-0 right-0 flex h-3 w-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
               </span>
             )}
             {status === 'permission-denied' ? (
                <AlertCircle className="w-10 h-10 text-red-600" />
             ) : (
                <Activity className={`w-10 h-10 text-indigo-600 ${status === 'connecting' ? 'animate-pulse' : ''}`} />
             )}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Tutor Live</h2>
        <p className="text-gray-500 text-sm">
            {status === 'idle' && "Start a voice conversation to learn about our courses."}
            {status === 'connecting' && "Connecting to Gemini..."}
            {status === 'connected' && "Listening... Speak naturally."}
            {status === 'error' && "Connection failed. Please try again."}
            {status === 'permission-denied' && "Microphone access denied. Please allow microphone permissions."}
        </p>
      </div>

      <div className="w-full h-24 bg-gray-50 rounded-lg mb-6 overflow-hidden relative border border-gray-100">
         <canvas ref={canvasRef} width="400" height="100" className="w-full h-full object-cover" />
         {!isActive && <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs">Visualizer inactive</div>}
      </div>

      <div className="flex items-center space-x-6">
        {!isActive ? (
             <button 
             onClick={startSession}
             disabled={status === 'permission-denied'}
             className={`px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all flex items-center ${
                 status === 'permission-denied' 
                 ? 'bg-gray-400 cursor-not-allowed text-white' 
                 : 'bg-indigo-600 hover:bg-indigo-700 text-white'
             }`}
           >
             <Mic className="w-5 h-5 mr-2" />
             {status === 'permission-denied' ? 'Permission Denied' : 'Start Conversation'}
           </button>
        ) : (
            <>
                <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                
                <button 
                    onClick={stopSession}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
                >
                    End Call
                </button>
            </>
        )}
      </div>
      
      <div className="mt-8 text-xs text-gray-400">
        Powered by Gemini Live API (Native Audio)
      </div>
    </div>
  );
};

export default LiveVoiceAgent;