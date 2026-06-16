import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { generatePinyin, isPunctuation } from '../utils/pinyinUtil';

const PronunciationChar = memo(function PronunciationChar({
  char,
  defaultPinyin,
  editingValue,
  isEditing,
  isPunc,
  onCommitEdit,
  onEditValueChange,
  onStartEdit,
  positionKey,
  pronunciation
}) {
  const [draftValue, setDraftValue] = useState(editingValue);
  const debounceTimerRef = useRef(null);
  const displayedPinyin = pronunciation || defaultPinyin || '';

  useEffect(() => {
    if (isEditing) {
      setDraftValue(editingValue);
    }
  }, [editingValue, isEditing]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const commitEdit = useCallback((value = draftValue) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    onCommitEdit(positionKey, value);
  }, [draftValue, onCommitEdit, positionKey]);

  const handleInputChange = useCallback((e) => {
    const nextValue = e.target.value;
    setDraftValue(nextValue);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onEditValueChange(nextValue);
    }, 250);
  }, [onEditValueChange]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      onCommitEdit(null);
    }
  }, [commitEdit, onCommitEdit]);

  const startEdit = useCallback(() => {
    if (!isPunc) {
      onStartEdit(positionKey, displayedPinyin);
    }
  }, [displayedPinyin, isPunc, onStartEdit, positionKey]);

  return (
    <div
      className={`char-container ${isPunc ? 'punctuation' : ''}`}
    >
      <div
        className={`char-item ${pronunciation ? 'has-pronunciation' : ''} ${isPunc ? 'punctuation' : ''}`}
        style={{ cursor: isPunc ? 'default' : 'pointer' }}
        onClick={startEdit}
        title={isPunc ? '' : displayedPinyin}
      >
        {char}
      </div>
      <div className="char-pinyin" onDoubleClick={startEdit}>
        {isEditing ? (
          <input
            type="text"
            value={draftValue}
            onChange={handleInputChange}
            onBlur={() => commitEdit()}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{ width: '60px' }}
          />
        ) : pronunciation ? (
          <span
            style={{ color: '#2196f3', fontWeight: 'bold', cursor: 'pointer' }}
            title="双击编辑拼音"
          >
            {pronunciation}
          </span>
        ) : (
          <span style={{ color: '#ccc' }}>{defaultPinyin}</span>
        )}
      </div>
    </div>
  );
});

function PronunciationManager({ text, customPronunciations, onSavePronunciations }) {
  const [pronunciations, setPronunciations] = useState(() => ({ ...customPronunciations }));
  const [editingKey, setEditingKey] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  useEffect(() => {
    setPronunciations({ ...customPronunciations });
    setEditingKey(null);
    setEditingValue('');
  }, [customPronunciations, text]);

  const characters = useMemo(() => text ? text.split('') : [], [text]);

  const defaultPinyin = useMemo(() => {
    if (!text) return {};

    const pinyinArray = generatePinyin(text);
    const pinyinMap = {};

    characters.forEach((char, index) => {
      if (!isPunctuation(char)) {
        pinyinMap[`${index}:${char}`] = pinyinArray[index];
      }
    });

    return pinyinMap;
  }, [characters, text]);

  const hasPronunciations = useMemo(
    () => Object.keys(pronunciations).length > 0,
    [pronunciations]
  );

  const handleRemoveAllPronunciations = () => {
    setPronunciations({});
  };

  const handleSave = () => {
    onSavePronunciations(pronunciations);
  };

  const handleStartEdit = useCallback((positionKey, value) => {
    setEditingKey(positionKey);
    setEditingValue(value);
  }, []);

  const handleCommitEdit = useCallback((positionKey, value = editingValue) => {
    if (!positionKey) {
      setEditingKey(null);
      return;
    }

    const trimmedValue = value.trim();

    if (trimmedValue) {
      setPronunciations(prev => {
        const updated = { ...prev };

        if (trimmedValue === defaultPinyin[positionKey]) {
          delete updated[positionKey];
        } else {
          updated[positionKey] = trimmedValue;
        }

        return updated;
      });
    }

    setEditingKey(null);
  }, [defaultPinyin, editingValue]);

  return (
    <div className="pronunciation-manager">
      <h3>多音字管理</h3>

      <div className="info-message" style={{ margin: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p>点击下面的汉字进行拼音设置，在预览中能直接看到设置效果。自定义的拼音会显示为蓝色加粗。</p>
        {hasPronunciations && (
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

      {characters.length > 0 && (
        <div className="text-characters">
          <h4>文本预览 (点击字符设置读音):</h4>
          <div className="text-preview">
            {characters.map((char, index) => {
              const positionKey = `${index}:${char}`;
              const isPunc = isPunctuation(char);

              return (
                <PronunciationChar
                  key={positionKey}
                  char={char}
                  defaultPinyin={defaultPinyin[positionKey]}
                  editingValue={editingKey === positionKey ? editingValue : ''}
                  isEditing={editingKey === positionKey}
                  isPunc={isPunc}
                  onCommitEdit={handleCommitEdit}
                  onEditValueChange={setEditingValue}
                  onStartEdit={handleStartEdit}
                  positionKey={positionKey}
                  pronunciation={pronunciations[positionKey]}
                />
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
