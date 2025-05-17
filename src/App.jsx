import { useState } from "react";
import { languages } from "./language";
import { getFarewellText, getRandomWord } from "./utils";
import clsx from "clsx";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import "./index.css";

export default function AssemblyEndgame() {
  // state values
  const [currentWord, setCurrentWord] = useState(() => getRandomWord());
  const [guessedLetters, setGuessedLetters] = useState([]);

  // derived values
  const wrongGuessCount =
    guessedLetters &&
    guessedLetters.filter((letter) => ![...currentWord].includes(letter))
      .length;
  const isGameWon = [...currentWord].every((letter) =>
    guessedLetters.includes(letter)
  );
  const isGameLost = wrongGuessCount >= languages.length - 1;
  const isGameOver = isGameWon || isGameLost;
  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1];
  const isLastGuessIncorrect = !currentWord.includes(lastGuessedLetter);

  const guessedRemain = languages.length - 1 - wrongGuessCount;

  // static values
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const { width, height } = useWindowSize();

  // => This method cause uncessary rerender cause it always return a new array eventhough the contents are the same
  // function addGussedLetter(letter) {
  //   setGuessedLetters((prevLetters) => {
  //     const lettersSet = new Set(prevLetters);
  //     lettersSet.add(letter);
  //     return Array.from(lettersSet);
  //   });
  // }

  function addGussedLetter(letter) {
    guessedLetters.includes(letter)
      ? letter
      : setGuessedLetters((prevletters) => [...prevletters, letter]);
  }

  function renderGameStaus() {
    if (!isGameOver) {
      if (wrongGuessCount > 0 && isLastGuessIncorrect) {
        return (
          <div style={{ textAlign: "center" }}>
            {getFarewellText(languages[wrongGuessCount - 1].name)}
            <span className="guess-left-msg">
              You have <span>{guessedRemain}</span> wrong-guesses left.
            </span>
          </div>
        );
      }
      return null;
    }
    if (isGameWon) {
      return (
        <>
          <h2>You win!</h2>
          <p>Well done! 🎉</p>
        </>
      );
    } else {
      return (
        <>
          <h2>Game over!</h2>
          <p>You lose! Better start learning Assembly 😭</p>
        </>
      );
    }
  }

  function startNewGame() {
    setCurrentWord(getRandomWord());
    setGuessedLetters([]);
  }

  const keyboardElements = [...alphabet].map((letter, id) => {
    const isGussed = guessedLetters.includes(letter);
    const isCorrect = currentWord.includes(letter);

    return (
      <button
        key={id}
        className={clsx("key", isGussed && (isCorrect ? "correct" : "wrong"))}
        onClick={() => addGussedLetter(letter)}
        disabled={isGameOver}
        aria-disabled={guessedLetters.includes(letter)}
        aria-label={`Letter ${letter}`}
      >
        {letter.toUpperCase()}
      </button>
    );
  });

  // const arr = currentWord.split("");
  const letterElements = [...currentWord].map((cha, id) => {
    const shouldRevealLetter = isGameLost || guessedLetters.includes(cha);
    return (
      <span
        key={id}
        className={clsx({
          "word-blank": true,
          "letter-missed": isGameLost && !guessedLetters.includes(cha),
        })}
      >
        {shouldRevealLetter && cha.toUpperCase()}
      </span>
    );
  });

  const languagesElements = languages.map((language, index) => {
    return (
      <span
        key={language.name}
        className={clsx(
          "language-chip",
          index < wrongGuessCount ? "lost" : null
        )}
        style={{
          backgroundColor: language.backgroundColor,
          color: language.color,
        }}
      >
        {language.name}
      </span>
    );
  });

  return (
    <main>
      {isGameWon && (
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "fixed",
            left: 0,
            top: 0,
            overflow: "hidden",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={1000}
          />
        </div>
      )}
      <header>
        <h1>Assembly: Endgame</h1>
        <p>
          Guess the word in under 8 attempts to keep the programming world safe
          from Assembly!
        </p>
      </header>

      <section
        className={clsx({
          status: true,
          farewell: !isGameOver && wrongGuessCount > 0 && isLastGuessIncorrect,
          "game-won": isGameWon,
          "game-lost": isGameLost,
        })}
        aria-live="polite"
        role="status"
      >
        {renderGameStaus()}
      </section>

      <section className="language-section">{languagesElements}</section>

      <section className="word-section">{letterElements}</section>

      {/* Combined visually-hidden aria-live region for status updates */}
      <section className="sr-only" aria-live="polite" role="status">
        <p>
          {currentWord.includes(lastGuessedLetter)
            ? `Correct! The letter ${lastGuessedLetter} is in the word`
            : `Sorry, the letter ${lastGuessedLetter} is not in the word`}
          You have {guessedRemain} attempts left.
        </p>
        <p>
          Current word:{" "}
          {currentWord
            .split("")
            .map((letter) =>
              guessedLetters.includes(letter) ? letter + "." : "blank."
            )
            .join(" ")}
        </p>
      </section>

      <section className="keyboard-section">{keyboardElements}</section>

      {isGameOver && (
        <button className="game-button" onClick={startNewGame}>
          New Game
        </button>
      )}
    </main>
  );
}
