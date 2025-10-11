import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'
import PersonalUpload from '@/components/dashboard/PersonalUpload'

export default function PersonalUploadPage() {
  return (
    <>
      <SignedIn>
        <PersonalUpload />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}