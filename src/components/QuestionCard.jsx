
export default function QuestionCard({
  question,
  index,
  selectedAnswer,
  onSelect,
  showResult = false,
  disabled = false,
}) {
  const getOptionStyle = (option) => {
    if (!showResult) {
      if (selectedAnswer === option) {
        return 'border-gold-400/70 bg-gold-400/10 text-white'
      }
      return 'border-white/10 text-slate-300 hover:border-white/25 hover:bg-white/3'
    }

    if (option === question.correctAnswer) {
      return 'border-emerald-400/60 bg-emerald-400/10 text-emerald-300'
    }
    if (option === selectedAnswer && option !== question.correctAnswer) {
      return 'border-red-400/60 bg-red-400/10 text-red-300'
    }
    return 'border-white/5 text-slate-500'
  }

  const getOptionIcon = (option) => {
    if (!showResult) return null
    if (option === question.correctAnswer) return '✓'
    if (option === selectedAnswer && option !== question.correctAnswer) return '✗'
    return null
  }

  return (
    <div className="card animate-slide-up">
      <div className="flex items-start gap-3 mb-5">
        <span className="badge-gold flex-shrink-0 mt-0.5">Q{index + 1}</span>
        <p className="text-white font-body font-medium leading-relaxed">{question.questionText}</p>
      </div>

      <div className="space-y-2.5">
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={() => !disabled && !showResult && onSelect?.(option)}
            disabled={disabled || showResult}
            className={`w-full text-left px-4 py-3 rounded-xl border font-body text-sm
              transition-all duration-150 flex items-center justify-between gap-3
              ${getOptionStyle(option)}
              ${!showResult && !disabled ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'}
            `}
          >
            <span className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full border border-current flex-shrink-0 flex items-center justify-center text-xs opacity-50">
                {String.fromCharCode(65 + i)}
              </span>
              {option}
            </span>
            {getOptionIcon(option) && (
              <span className="flex-shrink-0 font-semibold text-base">
                {getOptionIcon(option)}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
