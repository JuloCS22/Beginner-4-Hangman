import "./styles.css";
import { useState, useEffect } from "react";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const tableLetters = letters.split("");
const numbers = ["8", "9", "10", "11", "12"];

export default function App() {
  const [data, setData] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNumber, setSelectedNumber] = useState("7");
  const [falseLetter, setFalseLetters] = useState(0);
  const [usedLetters, setUsedLetters] = useState([]);
  const [revealedWord, setRevealedWord] = useState([]);
  let imgSrc = "/img/" + falseLetter + ".png";

  function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function fetchWord() {
    setLoading(true);
    let url = `https://trouve-mot.fr/api/size/${selectedNumber}`;
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur dans la requête");
        }
        return response.json();
      })
      .then((data) => {
        const word = data[0].name.toLowerCase();
        setData(removeAccents(word)); // Initialisation du mot
        setRevealedWord(Array(word.length).fill("-")); // En fonction de la taille du mot, remplace par "-"
        setLoading(false);
        setUsedLetters([]); // Remise à 0 des lettres utilisées
        setFalseLetters(0); // Remise à 0 du compteur d'erreur
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }

  useEffect(() => {
    // Lancement du fetch pour le 1er rendu
    fetchWord();
  }, [selectedNumber]);

  function handleChange(e) {
    // Gestion du changement de la taille du mot
    setSelectedNumber(e.target.value);
    fetchWord();
  }

  function handleLetterClick(letter) {
    // Gestion du click sur les lettres
    if (
      usedLetters.includes(letter) ||
      falseLetter >= 6 ||
      !revealedWord.includes("-")
    )
      return; // Si elle est déjà use, ne rien faire

    setUsedLetters([...usedLetters, letter]);

    if (data.includes(letter.toLowerCase())) {
      // Choisir d'afficher un tiret ou la lettre correspondant
      const newRevealedWord = revealedWord.map((char, index) =>
        data[index] === letter.toLowerCase() ? letter : char
      );
      setRevealedWord(newRevealedWord); // On renvoie le nouveau tableau avec les lettres découvertes
    } else {
      if (falseLetter >= 6) {
        return;
      } else {
        setFalseLetters(falseLetter + 1);
      }
    }
  }

  return (
    <div>
      <h1>HangmanGame</h1>
      <h2>V 2.0</h2>
      <div className="picAndWordHidden">
        <img src={imgSrc} alt="hangmanimg" />
        <div className="wordDisplay">
          {revealedWord.map((char, index) => (
            <button key={index} className="hidingWordButtons">
              {char}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label for="wordLength" className="choseWordLength">
          Choose a number of characters
        </label>
        <select
          name="wordLength"
          id="wordLength"
          value={selectedNumber}
          onChange={handleChange}
        >
          <option value=""></option>
          {numbers.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="lettersPlace">
        {tableLetters.map((l, index) => (
          <button
            key={index}
            className={`lettersButton ${
              usedLetters.includes(l) ? "usedButton" : ""
            }`}
            onClick={() => handleLetterClick(l)}
            disabled={usedLetters.includes(l)} // Désactiver si déjà utilisé
          >
            {l}
          </button>
        ))}
        <button className="resetButton" onClick={fetchWord}>
          RESET
        </button>
      </div>

      <div className="wonOrLose">
        {falseLetter >= 6 ? (
          <p className="lose">You just lost, loser</p>
        ) : !revealedWord.includes("-") ? (
          <p className="win">Congratulations! You won!</p>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
