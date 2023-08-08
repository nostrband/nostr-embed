import { Profile } from "../main/components/Zap.jsx"

export const ZapComment = ({zap}) => {
  return (
    <div className="ne-flex ne-items-center ne-gap-2">
    {!zap?.payerProfile ? (
      <div>{zap?.content}</div>
    ) : (
      <>
        <span className="ne-font-bold ne-text-[12px]">By: </span>
        <Profile profile={zap?.payerProfile} variant="xs" />
      </>
    )}
  </div>
  )
}