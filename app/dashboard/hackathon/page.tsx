import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'
import HackathonUpload from '@/components/dashboard/HackathonUpload'

export default function HackathonUploadPage() {
  return (
    <>
      <SignedIn>
        <HackathonUpload />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}