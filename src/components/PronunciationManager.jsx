import { useState, useEffect, useMemo } from 'react';
import { generatePinyin, isPunctuation } from '../utils/pinyinUtil';

function PronunciationManager({ text, customPronunciations, onSavePronunciations }) {
  const [pronunciations, setPronunciations] = useState({ ...customPronunciations });
  const [newChar, setNewChar] = useState('');
  const [newPinyin, setNewPinyin] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  // Create a structure to hold all character positions
  const charPositions = useMemo(() => {
    if (!text) return [];
    
    const positions = [];
    const chars = text.split('');
    
    chars.forEach((char, index) => {
      if (!isPunctuation(char)) {
        positions.push({
          char,
          position: index,
          key: `${index}:${char}`
        });
      }
    });
    
    return positions;
  }, [text]);
  
  // Get default pinyin for all characters in text
  const [defaultPinyin, setDefaultPinyin] = useState({});
  
  // Get default pinyin for text
  useEffect(() => {
    if (text) {
      // Generate default pinyin for the entire text
      const pinyinArray = generatePinyin(text);
      
      // Create a mapping with position keys
      const pinyinMap = {};
      text.split('').forEach((char, index) => {
        if (!isPunctuation(char)) {
          pinyinMap[`${index}:${char}`] = pinyinArray[index];
        }
      });
      
      setDefaultPinyin(pinyinMap);
    }
  }, [text]);

  const [selectedPosition, setSelectedPosition] = useState(null);

  const handleAddPronunciation = () => {
    if (newChar && newPinyin && selectedPosition !== null) {
      const positionKey = `${selectedPosition}:${newChar}`;
      
      setPronunciations({
        ...pronunciations,
        [positionKey]: newPinyin
      });
      
      setNewChar('');
      setNewPinyin('');
      setSelectedPosition(null);
    }
  };

  const handleRemoveAllPronunciations = () => {
    setPronunciations({});
  };
  
  // 保留以下函数以允许在UI中删除单个拼音配置项
  const handleRemovePronunciation = (positionKey) => {
    const updatedPronunciations = { ...pronunciations };
    delete updatedPronunciations[positionKey];
    setPronunciations(updatedPronunciations);
  };

  const handleSave = () => {
    // console.log('Saving pronunciations:', pronunciations);
    onSavePronunciations(pronunciations);
  };

  return (
    <div className="pronunciation-manager">
      <h3>多音字管理</h3>
      
      {/* <div className="add-pronunciation">
        <div className="form-group">
          <label htmlFor="new-char">字符:</label>
          <input 
            id="new-char"
            type="text" 
            value={newChar}
            onChange={(e) => setNewChar(e.target.value.charAt(0))}
            maxLength={1}
            placeholder="输入一个字"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="new-pinyin">拼音:</label>
          <input 
            id="new-pinyin"
            type="text" 
            value={newPinyin}
            onChange={(e) => setNewPinyin(e.target.value)}
            placeholder="输入拼音"
          />
        </div>
        
        <button 
          onClick={handleAddPronunciation}
          disabled={!newChar || !newPinyin}
        >
          添加
        </button>
      </div> */}
      
      <div className="info-message" style={{ margin: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p>点击下面的汉字进行拼音设置，在预览中能直接看到设置效果。自定义的拼音会显示为蓝色加粗。</p>
        {Object.keys(pronunciations).length > 0 && (
          <button 
            onClick={() => {
              const confirmed = window.confirm('确定要清除所有自定义读音吗？此操作无法撤销。');
              if (confirmed) {
                handleRemoveAllPronunciations();
              }
            }}
            style={{ backgroundColor: '#ff9800', padding: '5px 10px' }}
          >
            清除所有自定义读音
          </button>
        )}
      </div>
      
      {charPositions.length > 0 && (
        <div className="text-characters">
          <h4>文本预览 (点击字符设置读音):</h4>
          <div className="text-preview">
            {text.split('').map((char, index) => {
              const positionKey = `${index}:${char}`;
              const isPunc = isPunctuation(char);
              const hasCustomPronunciation = pronunciations[positionKey];
              
              return (
                <div 
                  key={positionKey} 
                  className={`char-container ${isPunc ? 'punctuation' : ''}`}
                >
                  <div 
                    className={`char-item ${hasCustomPronunciation ? 'has-pronunciation' : ''} ${isPunc ? 'punctuation' : ''}`}
                    style={{ cursor: isPunc ? 'default' : 'pointer' }}
                    onClick={() => {
                      if (isPunc) return;
                      setEditingKey(positionKey);
                      setEditingValue(pronunciations[positionKey] || defaultPinyin[positionKey] || '');
                    }}
                    title={isPunc ? '' : (pronunciations[positionKey] || defaultPinyin[positionKey] || '')}
                  >
                    {char}
                  </div>
                  <div className="char-pinyin" onDoubleClick={() => {
                    if (isPunc) return;
                    setEditingKey(positionKey);
                    setEditingValue(pronunciations[positionKey] || defaultPinyin[positionKey] || '');
                  }}>
                    {editingKey === positionKey ? (
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => {
                          if (editingValue.trim()) {
                            setPronunciations(prev => {
                              const updated = { ...prev };
                              if (editingValue.trim() === defaultPinyin[positionKey]) {
                                // 如果和默认值相同，删除自定义配置
                                delete updated[positionKey];
                              } else {
                                // 否则更新自定义拼音
                                updated[positionKey] = editingValue.trim();
                              }
                              return updated;
                            });
                          }
                          setEditingKey(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (editingValue.trim()) {
                              setPronunciations(prev => {
                                const updated = { ...prev };
                                if (editingValue.trim() === defaultPinyin[positionKey]) {
                                  // 如果和默认值相同，删除自定义配置
                                  delete updated[positionKey];
                                } else {
                                  // 否则更新自定义拼音
                                  updated[positionKey] = editingValue.trim();
                                }
                                return updated;
                              });
                            }
                            setEditingKey(null);
                          } else if (e.key === 'Escape') {
                            setEditingKey(null);
                          }
                        }}
                        autoFocus
                        style={{ width: '60px' }}
                      />
                    ) : (
                      <>
                        {hasCustomPronunciation ? (
                          <span
                            style={{ color: '#2196f3', fontWeight: 'bold', cursor: 'pointer' }}
                            title="双击编辑拼音"
                          >
                            {pronunciations[positionKey]}
                          </span>
                        ) : (
                          <span style={{ color: '#ccc' }}>{defaultPinyin[positionKey]}</span>
                        )}
                      </>
                    )}
                  </div>
                
                </div>
              );
            })}
          </div>
          
        </div>
      )}
      
      <div className="form-actions">
        <button 
          onClick={handleSave} 
          className="save-btn"
          style={{ 
            backgroundColor: '#4CAF50', 
            padding: '10px 20px',
            fontSize: '16px'
          }}
        >
          应用读音设置
        </button>
      </div>
    </div>
  );
}

export default PronunciationManager;