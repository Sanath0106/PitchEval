import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'
import ResultsPageWrapper from '@/components/dashboard/ResultsPageWrapper'

export default async function EvaluationResults({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // Ensure the id is properly serialized as a string
  const evaluationId = String(id)
  
  return (
    <>
      <SignedIn>
        <ResultsPageWrapper evaluationId={evaluationId} />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}