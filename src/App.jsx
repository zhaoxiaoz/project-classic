import { useState, useEffect } from 'react'
import './App.css'
import InputComponent from './components/InputComponent'
import TextDisplay from './components/TextDisplay'
import FileManagement from './components/FileManagement'
import PronunciationManager from './components/PronunciationManager'

// 工具函数：导出为 txt 文件
function exportCurrentTextAsTxt(currentText) {
  if (!currentText || !currentText.title) {
    alert('当前文本无标题，无法导出');
    return;
  }

  const data = JSON.stringify(currentText, null, 2);
  const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${currentText.title}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 工具函数：从 txt 文件中导入 JSON 格式的文本
function importSingleTextFromTxt(file, onLoad) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      onLoad(imported);
    } catch (error) {
      alert('导入失败，文件格式不正确');
    }
  };
  reader.readAsText(file);
}

function App() {
  const [currentText, setCurrentText] = useState({
    title: '',
    content: '',
    pinyin: [],
    customPronunciations: {}
  });

  const [currentPosition, setCurrentPosition] = useState(0);
  const [savedTexts, setSavedTexts] = useState([]);
  const [showFileManagement, setShowFileManagement] = useState(false);
  const [showPronunciationManager, setShowPronunciationManager] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  useEffect(() => {
    const storedTexts = localStorage.getItem('ancient-texts');
    if (storedTexts) {
      const parsedTexts = JSON.parse(storedTexts);
      setSavedTexts(parsedTexts);
      const lastSelectedId = localStorage.getItem('ancient-texts-last-selected');
      if (lastSelectedId) {
        const lastSelected = parsedTexts.find(text => text.id === lastSelectedId);
        if (lastSelected) {
          setCurrentText(lastSelected);
        }
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ancient-texts', JSON.stringify(savedTexts));
  }, [savedTexts]);

  return (
    <div className="app-container">
      <h1>Helper</h1>

      <div className="main-content">
        {showFileManagement ? (
          <div>
            <FileManagement 
              savedTexts={savedTexts}
              onSelectText={(text) => {
                setCurrentText(text);
                setCurrentPosition(0);
                localStorage.setItem('ancient-texts-last-selected', text.id);
                setShowFileManagement(false);
              }}
              onSaveText={(newText) => {
                const newSavedTexts = [...savedTexts, newText];
                setSavedTexts(newSavedTexts);
                localStorage.setItem('ancient-texts', JSON.stringify(newSavedTexts));
                setCurrentText(newText);
                localStorage.setItem('ancient-texts-last-selected', newText.id);
              }}
              onDeleteText={(textId) => {
                if (currentText.id === textId) {
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
                };
                setCurrentText(updatedText);
                const newSavedTexts = savedTexts.map(text => 
                  text.id === currentText.id ? updatedText : text
                );
                setSavedTexts(newSavedTexts);
                localStorage.setItem('ancient-texts', JSON.stringify(newSavedTexts));
                setShowPronunciationManager(false);
              }}
            />
            <div className="controls">
              <button onClick={() => setShowPronunciationManager(false)}>返回</button>
            </div>
          </div>
        ) : (
          <div className="memorization-container">
            <h2>{currentText.title || '未选择文本'}</h2>

            {/* <TextDisplay 
              text={currentText.content} 
              currentPosition={currentPosition}
            /> */}

            <div className="input-container">
              <InputComponent 
                text={currentText.content}
                pinyin={currentText.pinyin}
                customPronunciations={currentText.customPronunciations}
                onCorrectInput={(position) => setCurrentPosition(position)}
                resetTrigger={resetTrigger}
              />
              {currentText.content && currentPosition > 0 && currentPosition - 1 < currentText.content.length && (
                <div className="current-hint">
                  <small>当前字: <strong>{currentText.content[currentPosition - 1]}</strong></small>
                  {(() => {
                    const key = `${currentPosition - 1}:${currentText.content[currentPosition - 1]}`;
                    if (currentText.customPronunciations?.[key]) {
                      return <small>拼音: <strong style={{ color: '#2196f3' }}>{currentText.customPronunciations[key]}</strong></small>;
                    } else if (currentText.pinyin?.[currentPosition - 1]) {
                      return <small>拼音: {currentText.pinyin[currentPosition - 1]}</small>;
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
              {currentText.content && currentPosition === currentText.content.length && (
                <button
                  onClick={() => {
                    setCurrentPosition(0);
                    setResetTrigger(prev => prev + 1);
                  }}
                  style={{ backgroundColor: '#4caf50', fontWeight: 'bold' }}
                >
                  重新开始
                </button>
              )}
              <div style={{ marginTop: '1em' }}>
                <input
                  type="file"
                  accept=".txt"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      importSingleTextFromTxt(file, (importedText) => {
                        const exists = savedTexts.find(text => text.id === importedText.id);
                        const updatedTexts = exists
                          ? savedTexts.map(text => text.id === importedText.id ? importedText : text)
                          : [...savedTexts, importedText];

                        setSavedTexts(updatedTexts);
                        setCurrentText(importedText);
                        setCurrentPosition(0);
                        localStorage.setItem('ancient-texts', JSON.stringify(updatedTexts));
                        localStorage.setItem('ancient-texts-last-selected', importedText.id);
                        alert('导入成功');
                      });
                    }
                  }}
                />
                <button
                  onClick={() => exportCurrentTextAsTxt(currentText)}
                  style={{ marginLeft: '0.5em' }}
                >
                  导出当前文本
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
