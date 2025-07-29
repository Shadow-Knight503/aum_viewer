import { useState, useEffect } from 'react';
import { RefreshCcw, User, DollarSign, CheckCircle } from 'lucide-react';

function App() {
  const API_BASE_URL = 'https://candidate-002-powerofaum-module-sub.vercel.app';

  const [getUserId, setGetUserId] = useState('USER_001');
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isLoadingGet, setIsLoadingGet] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [updateUserId, setUpdateUserId] = useState('USER_001');
  const [newPlan, setNewPlan] = useState('monthly_spiritual');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [updateResponse, setUpdateResponse] = useState(null);

  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setEffectiveDate(now.toISOString().slice(0, 16));
  }, []);

  const showMessage = (text: string, type: string) => {
    setMessage({ text, type });

    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const getSubscriptionStatus = async () => {
    setIsLoadingGet(true);
    setSubscriptionData(null);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/api/subscription-status?userId=${getUserId}`);
      const data = await response.json();

      if (response.ok) {
        setSubscriptionData(data.subscription);
        showMessage('Subscription status fetched successfully!', 'success');
      } else {
        showMessage(`Error: ${data.message || response.statusText}`, 'error');
      }
    } catch (error: unknown) {
      showMessage(`Network Error: ${error}`, 'error');
    } finally {
      setIsLoadingGet(false);
    }
  };

  const updateSubscription = async () => {
    setIsLoadingUpdate(true);
    setUpdateResponse(null);
    setMessage({ text: '', type: '' });

    if (!updateUserId || !newPlan || !effectiveDate) {
      showMessage('Please fill all fields for update.', 'error');
      setIsLoadingUpdate(false);
      return;
    }


    const formattedEffectiveDate = new Date(effectiveDate).toISOString().slice(0, -1) + 'Z';

    try {
      const response = await fetch(`${API_BASE_URL}/api/update-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: updateUserId,
          newPlan: newPlan,
          effectiveDate: formattedEffectiveDate,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setUpdateResponse(data.subscription);
        showMessage('Subscription updated successfully!', 'success');

        setGetUserId(updateUserId);
        getSubscriptionStatus();
      } else {
        const errorMessage = data.message
          ? (Array.isArray(data.message) ? data.message.join(', ') : data.message)
          : response.statusText;
        showMessage(`Error updating subscription: ${errorMessage}`, 'error');
      }
    } catch (error) {
      showMessage(`Network Error: ${error}`, 'error');
    } finally {
      setIsLoadingUpdate(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-700 flex items-center justify-center p-4 font-inter">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <h1 className="text-4xl font-extrabold text-indigo-800 mb-8 text-center col-span-full">
          PowerOfAum Subscription Manager
        </h1>

        {/* Message Box */}
        {message.text && (
          <div
            className={`col-span-full p-4 rounded-lg text-center font-medium ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            } shadow-md`}
          >
            {message.text}
          </div>
        )}

        {/* Get Subscription Status Section */}
        <div className="bg-indigo-50 p-6 rounded-lg shadow-md border border-indigo-200">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-5 flex items-center">
            <User className="mr-2 text-indigo-600" size={24} /> Get Subscription Status
          </h2>
          <label htmlFor="getUserId" className="block text-gray-700 text-sm font-bold mb-2">
            User ID:
          </label>
          <input
            type="text"
            id="getUserId"
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
            value={getUserId}
            onChange={(e) => setGetUserId(e.target.value)}
            placeholder="e.g., USER_001"
          />
          <button
            onClick={getSubscriptionStatus}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out transform hover:scale-105 flex items-center justify-center"
            disabled={isLoadingGet}
          >
            {isLoadingGet ? (
              <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <RefreshCcw className="mr-2" size={20} />
            )}
            {isLoadingGet ? 'Fetching...' : 'Get Status'}
          </button>

          <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-3 border-b pb-2 border-indigo-200">
            Current Subscription:
          </h3>
          <pre className="bg-gray-800 text-white p-4 rounded-lg text-sm overflow-x-auto shadow-inner">
            {subscriptionData ? JSON.stringify(subscriptionData, null, 2) : 'No data fetched yet.'}
          </pre>
        </div>

        {/* Update Subscription Section */}
        <div className="bg-purple-50 p-6 rounded-lg shadow-md border border-purple-200">
          <h2 className="text-2xl font-semibold text-purple-700 mb-5 flex items-center">
            <DollarSign className="mr-2 text-purple-600" size={24} /> Update Subscription
          </h2>
          <label htmlFor="updateUserId" className="block text-gray-700 text-sm font-bold mb-2">
            User ID:
          </label>
          <input
            type="text"
            id="updateUserId"
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
            value={updateUserId}
            onChange={(e) => setUpdateUserId(e.target.value)}
            placeholder="e.g., USER_001"
          />

          <label htmlFor="newPlan" className="block text-gray-700 text-sm font-bold mb-2">
            New Plan:
          </label>
          <select
            id="newPlan"
            className="shadow border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
            value={newPlan}
            onChange={(e) => setNewPlan(e.target.value)}
          >
            <option value="monthly_spiritual">Monthly Spiritual</option>
            <option value="annual_spiritual">Annual Spiritual</option>
            <option value="free">Free</option>
          </select>

          <label htmlFor="effectiveDate" className="block text-gray-700 text-sm font-bold mb-2">
            Effective Date:
          </label>
          <input
            type="datetime-local"
            id="effectiveDate"
            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
          />
          <button
            onClick={updateSubscription}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out transform hover:scale-105 flex items-center justify-center"
            disabled={isLoadingUpdate}
          >
            {isLoadingUpdate ? (
              <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <CheckCircle className="mr-2" size={20} />
            )}
            {isLoadingUpdate ? 'Updating...' : 'Update Subscription'}
          </button>

          <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-3 border-b pb-2 border-purple-200">
            Update Response:
          </h3>
          <pre className="bg-gray-800 text-white p-4 rounded-lg text-sm overflow-x-auto shadow-inner">
            {updateResponse ? JSON.stringify(updateResponse, null, 2) : 'No update response yet.'}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App
