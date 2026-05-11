import { useState } from 'react'
import api from '../services/api'

function BMICalculator() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const calculateBMI = async () => {
    if (!height || !weight) {
      setError('Please enter both height and weight.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await api.post('/api/bmi', { height: parseFloat(height), weight: parseFloat(weight) })
      setResult(response.data)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to calculate BMI.')
    } finally {
      setLoading(false)
    }
  }

  const getBMICategoryColor = (category) => {
    switch (category) {
      case 'Underweight': return 'text-blue-600'
      case 'Normal weight': return 'text-green-600'
      case 'Overweight': return 'text-yellow-600'
      case 'Obese': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">BMI Calculator</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="170"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="70"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={calculateBMI}
          disabled={loading}
          className="w-full bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Calculating...' : 'Calculate BMI'}
        </button>

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-gray-900">{result.bmi}</div>
              <div className={`text-lg font-medium ${getBMICategoryColor(result.category)}`}>
                {result.category}
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center">{result.advice}</p>
          </div>
        )}
      </div>

      <div className="mt-6 text-xs text-gray-500 text-center">
        BMI = weight (kg) / [height (m)]²
      </div>
    </div>
  )
}

export default BMICalculator