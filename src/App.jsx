import { useState, useEffect } from 'react'
import './App.css'
import InputComponent from './components/InputComponent'
import TextDisplay from './components/TextDisplay'
import FileManagement from './components/FileManagement'
import PronunciationManager from './components/PronunciationManager'

function App() {
  // State for the current text being memorized
  const [currentText, setCurrentText] = useState({
    title: '',
    content: '',
    pinyin: [],
    customPronunciations: {}
  })
  
  // State to track the current position in the text
  const [currentPosition, setCurrentPosition] = useState(0)

  // State for the list of saved texts
  const [savedTexts, setSavedTexts] = useState([])

  // State to control the display of file management UI
  const [showFileManagement, setShowFileManagement] = useState(false)
  
  // State to control the display of pronunciation management UI
  const [showPronunciationManager, setShowPronunciationManager] = useState(false)
  
  // Load saved texts from localStorage on component mount
  useEffect(() => {
    const storedTexts = localStorage.getItem('ancient-texts')
    if (storedTexts) {
      const parsedTexts = JSON.parse(storedTexts);
      setSavedTexts(parsedTexts);
      
      // If there is a previously selected text, restore it
      const lastSelectedId = localStorage.getItem('ancient-texts-last-selected');
      if (lastSelectedId) {
        const lastSelected = parsedTexts.find(text => text.id === lastSelectedId);
        if (lastSelected) {
          setCurrentText(lastSelected);
        }
      }
    }
  }, [])
  
  // Save texts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ancient-texts', JSON.stringify(savedTexts))
  }, [savedTexts])

  return (
    <div className="app-container">
      <h1>Helper</h1>
      
      <div className="main-content">
        {showFileManagement ? (
          <div>
            <FileManagement 
              savedTexts={savedTexts}
              onSelectText={(text) => {
                setCurrentText(text)
                setCurrentPosition(0)
                // 保存最后选择的文本ID
                localStorage.setItem('ancient-texts-last-selected', text.id)
                setShowFileManagement(false)
              }}
              onSaveText={(newText) => {
                const newSavedTexts = [...savedTexts, newText];
                setSavedTexts(newSavedTexts);
                
                // 立即保存到localStorage
                localStorage.setItem('ancient-texts', JSON.stringify(newSavedTexts));
                
                // 自动选择新添加的文本
                setCurrentText(newText);
                localStorage.setItem('ancient-texts-last-selected', newText.id);
              }}
              onDeleteText={(textId) => {
                // 检查是否删除当前选中的文本
                if (currentText.id === textId) {
                  // 如果删除的是当前文本，清除当前选择
                  setCurrentText({
                    title: '',
                    content: '',
                    pinyin: [],
                    customPronunciations: {}
                  });
                  setCurrentPosition(0);
                  localStorage.removeItem('ancient-texts-last-selected');
                }
                
                const newSavedTexts = savedTexts.filter(text => text.id !== textId);
                setSavedTexts(newSavedTexts);
                
                // 立即更新localStorage
                localStorage.setItem('ancient-texts', JSON.stringify(newSavedTexts));
              }}
            />
            <div className="controls">
              <button onClick={() => setShowFileManagement(false)}>返回</button>
            </div>
          </div>
        ) : showPronunciationManager ? (
          <div>
            <PronunciationManager 
              text={currentText.content}
              customPronunciations={currentText.customPronunciations}
              onSavePronunciations={(updatedPronunciations) => {
                const updatedText = {
                  ...currentText,
                  customPronunciations: updatedPronunciations
                }
                
                // Update current text
                console.log('Saving updated pronunciations:', updatedPronunciations);
                setCurrentText(updatedText);
                
                // Update in saved texts
                const newSavedTexts = savedTexts.map(text => 
                  text.id === currentText.id ? updatedText : text
                );
                setSavedTexts(newSavedTexts);
                
                // 立即保存到localStorage，确保数据不会丢失
                localStorage.setItem('ancient-texts', JSON.stringify(newSavedTexts));
                
                // For debugging
                console.log('Updated current text:', updatedText);
                
                setShowPronunciationManager(false)
              }}
            />
            <div className="controls">
              <button onClick={() => setShowPronunciationManager(false)}>返回</button>
            </div>
          </div>
        ) : (
          <div className="memorization-container">
            <h2>{currentText.title || '未选择文本'}</h2>
            
            <TextDisplay 
              text={currentText.content} 
              currentPosition={currentPosition}
            />
            
            <div className="input-container">
              <InputComponent 
                text={currentText.content}
                pinyin={currentText.pinyin}
                customPronunciations={currentText.customPronunciations}
                onCorrectInput={(position) => setCurrentPosition(position)}
              />
              {currentText.content && currentPosition >= 0 && currentPosition < currentText.content.length && (
                <div className="current-hint">
                  <small>当前字: <strong>{currentText.content[currentPosition]}</strong></small>
                  {(() => {
                    // 检查是否有自定义拼音
                    const positionKey = `${currentPosition}:${currentText.content[currentPosition]}`;
                    if (currentText.customPronunciations && currentText.customPronunciations[positionKey]) {
                      return <small>拼音: <strong style={{color: '#2196f3'}}>{currentText.customPronunciations[positionKey]}</strong></small>;
                    } else if (currentText.pinyin && currentText.pinyin[currentPosition]) {
                      return <small>拼音: {currentText.pinyin[currentPosition]}</small>;
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
            
            <div className="controls">
              <button onClick={() => setShowFileManagement(true)}>文件管理</button>
              {currentText.content && (
                <button onClick={() => setShowPronunciationManager(true)}>多音字管理</button>
              )}
              {currentPosition === currentText.content.length && currentText.content.length > 0 && (
                <button 
                  onClick={() => setCurrentPosition(0)}
                  style={{ backgroundColor: '#4caf50', fontWeight: 'bold' }}
                >
                  重新开始
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
