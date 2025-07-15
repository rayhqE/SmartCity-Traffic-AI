"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2 } from "lucide-react"

interface VoiceCommandsProps {
  isActive: boolean
  onToggle: (active: boolean) => void
  onCommand: (command: string) => void
}

export default function VoiceCommands({ isActive, onToggle, onCommand }: VoiceCommandsProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (SpeechRecognition) {
      setIsSupported(true)
      recognitionRef.current = new SpeechRecognition()

      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript)
          processCommand(finalTranscript.toLowerCase().trim())
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const processCommand = (command: string) => {
    const commands = {
      "show traffic": () => onCommand("show_traffic"),
      "find route": () => onCommand("find_route"),
      "check alerts": () => onCommand("check_alerts"),
      "start navigation": () => onCommand("start_navigation"),
      "show analytics": () => onCommand("show_analytics"),
      "clear route": () => onCommand("clear_route"),
      "zoom in": () => onCommand("zoom_in"),
      "zoom out": () => onCommand("zoom_out"),
      "go home": () => onCommand("go_home"),
      "refresh data": () => onCommand("refresh_data"),
    }

    // Find matching command
    const matchedCommand = Object.keys(commands).find((cmd) => command.includes(cmd) || cmd.includes(command))

    if (matchedCommand) {
      commands[matchedCommand as keyof typeof commands]()

      // Voice feedback
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(`Executing ${matchedCommand}`)
        utterance.rate = 0.8
        utterance.pitch = 1.1
        speechSynthesis.speak(utterance)
      }

      // Haptic feedback
      if ("vibrate" in navigator) {
        navigator.vibrate([100, 50, 100])
      }
    }

    setTranscript("")
  }

  const toggleListening = () => {
    if (!isSupported) return

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
    }
  }

  const toggleVoiceCommands = () => {
    const newState = !isActive
    onToggle(newState)

    if (!newState && isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    }
  }

  if (!isSupported) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-500">
        Voice not supported
      </Badge>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isActive ? "default" : "outline"}
        size="sm"
        onClick={toggleVoiceCommands}
        className="bg-white/50 backdrop-blur-sm hover:bg-white/70"
      >
        <Volume2 className="h-4 w-4 mr-2" />
        Voice {isActive ? "ON" : "OFF"}
      </Button>

      {isActive && (
        <Button
          variant={isListening ? "destructive" : "outline"}
          size="sm"
          onClick={toggleListening}
          className={`${
            isListening
              ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
              : "bg-white/50 backdrop-blur-sm hover:bg-white/70"
          }`}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      )}

      {transcript && (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 max-w-xs truncate">
          "{transcript}"
        </Badge>
      )}
    </div>
  )
}
