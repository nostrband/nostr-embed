


export default function Zap({state}) {
  return (
    <div className="nostrEmbedCard">
      Zap content: {JSON.stringify(state?.event)}
    </div>
  )
}