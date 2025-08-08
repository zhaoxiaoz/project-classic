function TextDisplay({ text, currentPosition }) {
  if (!text) return <div className="empty-text">请选择或添加段落</div>;

  return (
    <div className="text-display">
      {text.split('').map((char, index) => {
        let className = 'char-future';
        
        if (index < currentPosition) {
          className = 'char-correct';
        } else if (index === currentPosition) {
          className = 'char-current';
        }
        
        return (
          <span key={index} className={className}>
            {char}
          </span>
        );
      })}
    </div>
  );
}

export default TextDisplay;