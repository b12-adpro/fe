import Link from "next/link"

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Welcome to GatherLove</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          A heartfelt crowdfunding platform where communities come together to support causes with love. Create
          campaigns, make donations, and spread kindness through collective giving.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Create Campaigns</h3>
            <p className="text-gray-600 mb-4">Start your own fundraising campaign and reach your goals.</p>
            <Link href="/campaign" className="text-green-600 hover:text-green-700 font-medium">
              View Campaigns →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Make Donations</h3>
            <p className="text-gray-600 mb-4">Support causes you care about with secure donations.</p>
            <Link href="/donation" className="text-green-600 hover:text-green-700 font-medium">
              View Donations →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Manage Wallet</h3>
            <p className="text-gray-600 mb-4">Top up your wallet and track your transactions.</p>
            <Link href="/wallet" className="text-green-600 hover:text-green-700 font-medium">
              View Wallet →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}