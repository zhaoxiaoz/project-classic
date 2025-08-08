import { useState } from 'react';
import { generatePinyin } from '../utils/pinyinUtil';

function FileManagement({ savedTexts, onSelectText, onSaveText, onDeleteText }) {
  const [newTextTitle, setNewTextTitle] = useState('');
  const [newTextContent, setNewTextContent] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddText = () => {
    if (newTextTitle.trim() && newTextContent.trim()) {
      // Auto-generate pinyin for the content
      const pinyinArray = generatePinyin(newTextContent);
      
      const newText = {
        id: Date.now().toString(),
        title: newTextTitle,
        content: newTextContent,
        pinyin: pinyinArray, // Auto-generated pinyin
        customPronunciations: {}
        // customPronunciations will be in format: {"position:char": "pinyin"}
      };
      
      onSaveText(newText);
      
      // Reset the form
      setNewTextTitle('');
      setNewTextContent('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="file-management">
      <h2>文件管理</h2>
      
      <div className="text-list">
        <h3>已保存的古文</h3>
        {savedTexts.length === 0 ? (
          <p>暂无保存的古文</p>
        ) : (
          <ul>
            {savedTexts.map(text => (
              <li key={text.id}>
                <div className="text-item">
                  <span>{text.title}</span>
                  <div className="text-actions">
                    <button onClick={() => onSelectText(text)}>选择</button>
                    <button 
                      onClick={() => onDeleteText(text.id)}
                      className="delete-btn"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {showAddForm ? (
        <div className="add-text-form">
          <h3>添加新古文</h3>
          <div className="form-group">
            <label htmlFor="text-title">标题:</label>
            <input
              id="text-title"
              type="text"
              value={newTextTitle}
              onChange={(e) => setNewTextTitle(e.target.value)}
              placeholder="输入古文标题"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="text-content">内容:</label>
            <textarea
              id="text-content"
              value={newTextContent}
              onChange={(e) => setNewTextContent(e.target.value)}
              placeholder="输入古文内容"
              rows={6}
            />
          </div>
          
          <div className="form-actions">
            <button onClick={handleAddText}>保存</button>
            <button 
              onClick={() => setShowAddForm(false)}
              className="cancel-btn"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setShowAddForm(true)}
          className="add-btn"
        >
          添加新古文
        </button>
      )}
    </div>
  );
}

export default FileManagement;