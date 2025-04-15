import { useEffect, useState } from "react"

const characters = "!<>-_\\/[]{}—=+*^?#@%&|~"

export const useTextScramble = (text: string, duration: number) => {
  const [scrambledText, setScrambledText] = useState(text)

  useEffect(() => {
    let timer: NodeJS.Timeout
    let startTime: number

    const getRandomChar = () =>
      characters[Math.floor(Math.random() * characters.length)]

    const update = () => {
      const progress = (Date.now() - startTime) / duration

      if (progress >= 1) {
        setScrambledText(text)
        return
      }

      const result = text
        .split("")
        .map((char, index) => {
          if (progress > 0.7) {
            const revealIndex = Math.floor(
              ((progress - 0.7) / 0.3) * text.length,
            )
            return index < revealIndex ? char : getRandomChar()
          }
          return getRandomChar()
        })
        .join("")

      setScrambledText(result)
      timer = setTimeout(update, 50)
    }

    const startScramble = () => {
      clearTimeout(timer)
      startTime = Date.now()
      update()
    }

    startScramble()
    const restartInterval = setInterval(startScramble, 7000)

    return () => {
      clearTimeout(timer)
      clearInterval(restartInterval)
    }
  }, [text, duration])

  return { text: scrambledText }
}
