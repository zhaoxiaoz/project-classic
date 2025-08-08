import { useState, useEffect } from 'react';
import { getPinyinInitial, isPunctuation } from '../utils/pinyinUtil';

function InputComponent({ text, pinyin, onCorrectInput, customPronunciations }) {
  const [input, setInput] = useState('');
  const [currentPosition, setCurrentPosition] = useState(0);
  const [displayedChars, setDisplayedChars] = useState([]);

  // Reset component state when a new text is loaded
  useEffect(() => {
    setInput('');
    setCurrentPosition(0);
    setDisplayedChars([]);
  }, [text]);

  // Helper function to get the pinyin initial of a character for the current position
  // Used in getFollowingPunctuation
  
  // Get all punctuation marks up to the next non-punctuation character
  const getFollowingPunctuation = (position) => {
    const punctuationChars = [];
    let pos = position;
    
    while (pos < text.length && isPunctuation(text[pos])) {
      punctuationChars.push(text[pos]);
      pos++;
    }
    
    return {
      chars: punctuationChars,
      nextPosition: pos
    };
  };
  
  // Skip punctuation on initial load and when text changes
  useEffect(() => {
    if (text && currentPosition < text.length && isPunctuation(text[currentPosition])) {
      const { chars: punctuationChars, nextPosition } = getFollowingPunctuation(currentPosition);
      
      // Add punctuation to displayed chars
      if (punctuationChars.length > 0) {
        setDisplayedChars(prev => [...prev, ...punctuationChars]);
      }
      
      setCurrentPosition(nextPosition);
      onCorrectInput(nextPosition);
    }
  }, [text]);

  const getCurrentPinyinInitial = () => {
    if (!text || currentPosition >= text.length) return null;
    
    const char = text[currentPosition];
    
    // Check if the character is punctuation
    if (isPunctuation(char)) {
      // Should automatically skip, but just in case
      return '';
    }
    
    // Check if there is a custom pronunciation defined for this character at this position
    const positionKey = `${currentPosition}:${char}`;
    console.log('Current position key:', positionKey);
    console.log('Custom pronunciations:', JSON.stringify(customPronunciations));
    
    if (customPronunciations && customPronunciations[positionKey]) {
      console.log('Found custom pronunciation:', customPronunciations[positionKey]);
      return getPinyinInitial(customPronunciations[positionKey]);
    }

    // If pinyin data is available for this position, use it
    if (pinyin && pinyin[currentPosition]) {
      return getPinyinInitial(pinyin[currentPosition]);
    }

    // Default behavior: no pinyin data available
    return null;
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toLowerCase();
    
    // Only update if we haven't reached the end of the text
    if (currentPosition < text.length) {
      setInput(value);
      
      // Check if the input matches the pinyin initial of the current character
      const expectedInitial = getCurrentPinyinInitial();
      
      if (expectedInitial && value === expectedInitial) {
        // Correct input - add the character to displayed chars
        let newDisplayedChars = [...displayedChars, text[currentPosition]];
        
        // Check for any punctuation after the current character
        let newPosition = currentPosition + 1;
        const { chars: punctuationChars, nextPosition } = getFollowingPunctuation(newPosition);
        
        // Add any punctuation to displayed chars
        if (punctuationChars.length > 0) {
          newDisplayedChars = [...newDisplayedChars, ...punctuationChars];
        }
        
        setDisplayedChars(newDisplayedChars);
        setCurrentPosition(nextPosition);
        
        // Clear the input field
        setInput('');
        
        // Notify parent component
        onCorrectInput(newPosition);
      }
    }
  };

  // 计算完成百分比
  const completionPercentage = text ? Math.round((currentPosition / text.length) * 100) : 0;
  
  return (
    <div className="input-component">
      <div className="displayed-chars">
        {displayedChars.map((char, index) => (
          <span key={index} className="char-correct">{char}</span>
        ))}
        {currentPosition < text.length && (
          <span className="char-current">_</span>
        )}
      </div>
      
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder="输入拼音首字母..."
        disabled={currentPosition >= text.length}
        maxLength={1}
        autoFocus
      />
      
      <div className="progress-container">
        <div className="progress">
          已完成: {currentPosition}/{text.length} 字 ({completionPercentage}%)
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{
              width: `${completionPercentage}%`,
              backgroundColor: completionPercentage < 30 ? '#ff9800' : 
                             completionPercentage < 70 ? '#2196f3' : 
                             '#4caf50'
            }}
          />
        </div>
      </div>
      
      {currentPosition >= text.length && text && text.length > 0 && (
        <div className="completion-message">
          <h3>恭喜！你已完成记忆</h3>
          <p>可以点击"重新开始"按钮再次练习</p>
        </div>
      )}
    </div>
  );
}

export default InputComponent;