import { useState, useEffect, useRef, useCallback } from 'react';
import { getPinyinInitial, isPunctuation } from '../utils/pinyinUtil';

function InputComponent({ text, pinyin, onCorrectInput, customPronunciations, resetTrigger, elapsedTime }) {
  const [input, setInput] = useState('');
  const [currentPosition, setCurrentPosition] = useState(0);
  const [displayedChars, setDisplayedChars] = useState([]);

  const [totalInputs, setTotalInputs] = useState(0);
  const [correctInputs, setCorrectInputs] = useState(0);
  
  const displayedCharsRef = useRef(null);
  const inputRef = useRef(null);

  // Reset component state when a new text is loaded
  useEffect(() => {
    setInput('');
    setCurrentPosition(0);
    setDisplayedChars([]);
    setTotalInputs(0);
    setCorrectInputs(0);
  }, [text]);

  useEffect(() => {
    setInput('');
    setCurrentPosition(0);
    setDisplayedChars([]);
    setTotalInputs(0);
    setCorrectInputs(0);
  }, [resetTrigger]);

  useEffect(() => {
    if (displayedCharsRef.current) {
      displayedCharsRef.current.scrollTop = displayedCharsRef.current.scrollHeight;
    }
  }, [displayedChars]);

  // Helper function to get the pinyin initial of a character for the current position
  // Used in getFollowingPunctuation
  
  // Get all punctuation marks up to the next non-punctuation character
  const getFollowingPunctuation = useCallback((position) => {
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
  }, [text]);
  
  // Skip punctuation whenever the active position lands on punctuation, including restart.
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
  }, [currentPosition, getFollowingPunctuation, onCorrectInput, text]);

  useEffect(() => {
    if (inputRef.current && currentPosition < text.length) {
      inputRef.current.focus();
    }
  }, [currentPosition, resetTrigger, text.length]);

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
    // console.log('Current position key:', positionKey);
    // console.log('Custom pronunciations:', JSON.stringify(customPronunciations));
    
    if (customPronunciations && customPronunciations[positionKey]) {
      // console.log('Found custom pronunciation:', customPronunciations[positionKey]);
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
      if (expectedInitial) {
        setTotalInputs(prev => prev + 1);
      }
      
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
        
        setCorrectInputs(prev => prev + 1);

        setDisplayedChars(newDisplayedChars);
        setCurrentPosition(nextPosition);
        
        // Notify parent component
        onCorrectInput(nextPosition);
      }

      // Clear the input field
      setInput('');
    }
  };

  // 计算完成百分比
  const completionPercentage = text ? Math.round((currentPosition / text.length) * 100) : 0;
  
  return (
    <div className="input-component">
      <div className="displayed-chars" ref={displayedCharsRef}  style={{ textAlign: 'left' }}>
        {displayedChars.map((char, index) => {
          if (char === '\n') {
            return <br key={index} />;
          }
          return <span key={index} className="char-correct">{char}</span>;
        })}
        {currentPosition < text.length && (
          <span className="char-current">_</span>
        )}
      </div>
      
      {currentPosition < text.length && (
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="输入拼音首字母..."
          disabled={currentPosition >= text.length}
          maxLength={1}
          autoFocus
          style={{
            width: '12em',
            textAlign: 'center',
            fontSize: '1.2em'
          }}
        />
      )}
      
      <div className="progress-container">
        <div className="progress">
          已完成: {currentPosition}/{text.length} 字 ({completionPercentage}%)
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{
              width: `${completionPercentage}%`,
              backgroundColor: completionPercentage < 30 ? 'var(--primary-top)' :
                             completionPercentage < 70 ? 'var(--accent)' :
                             'var(--success-hover)'
            }}
          />
        </div>
      </div>
      
      {currentPosition >= text.length && text && text.length > 0 && (
        <div className="completion-message">
          <h3>🎉 恭喜！您已完成记忆</h3>
          <p>用时：{Math.floor(elapsedTime / 60)} 分 {elapsedTime % 60} 秒</p>
          <p>正确率：{totalInputs > 0 ? ((correctInputs / totalInputs) * 100).toFixed(1) : '0'}%</p>
          <p>可以点击“重新开始”按钮再次练习</p>
        </div>
      )}
    </div>
  );
}

export default InputComponent;
