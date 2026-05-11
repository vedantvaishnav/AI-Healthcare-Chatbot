import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { FiPlus, FiZap, FiMoon, FiActivity } from 'react-icons/fi'
import { FaTint } from 'react-icons/fa'
function HealthTracker() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [recordInputs, setRecordInputs] = useState({ water: '', calories: '', exercise: '', sleep: '' })

  const recordTypes = [
    { type: 'water', label: 'Water Intake', unit: 'ml', icon: FaTint, color: 'text-blue-600' },
    { type: 'calories', label: 'Calories', unit: 'kcal', icon: FiZap, color: 'text-orange-600' },
    { type: 'exercise', label: 'Exercise', unit: 'min', icon: FiActivity, color: 'text-green-600' },
    { type: 'sleep', label: 'Sleep', unit: 'hours', icon: FiMoon, color: 'text-purple-600' },
  ]

  useEffect(() => {
    if (user) {
      fetchRecords()
      fetchSummary()
    }
  }, [user, selectedDate])

  const fetchRecords = async () => {
    try {
      const response = await api.get('/api/health-records', {
        params: { date: selectedDate }
      })
      setRecords(response.data.records)
    } catch (error) {
      console.error('Failed to fetch health records:', error)
    }
  }

  const fetchSummary = async () => {
    try {
      const response = await api.get('/api/health-summary', {
        params: { date: selectedDate }
      })
      setSummary(response.data.summary)
    } catch (error) {
      console.error('Failed to fetch health summary:', error)
    }
  }

  const addRecord = async (type, value, unit) => {
    if (!value || value <= 0) return

    setLoading(true)
    try {
      await api.post('/api/health-records', {
        type,
        value: parseFloat(value),
        unit,
        date: selectedDate,
      })
      fetchRecords()
      fetchSummary()
    } catch (error) {
      console.error('Failed to add health record:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRecordTypeInfo = (type) => {
    return recordTypes.find(rt => rt.type === type) || {}
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Health Tracker</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {/* Daily Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {recordTypes.map(({ type, label, unit, icon: Icon, color }) => (
            <div key={type} className="bg-gray-50 rounded-lg p-4 text-center">
              <Icon className={`h-6 w-6 mx-auto mb-2 ${color}`} />
              <div className="text-2xl font-bold text-gray-900">
                {summary[type] || 0}
              </div>
              <div className="text-sm text-gray-600">{unit}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Add Records */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recordTypes.map(({ type, label, unit, icon: Icon, color }) => (
            <div key={type} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Icon className={`h-5 w-5 mr-2 ${color}`} />
                <span className="font-medium text-gray-900">{label}</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={recordInputs[type]}
                  onChange={(e) => setRecordInputs((prev) => ({ ...prev, [type]: e.target.value }))}
                  placeholder={`Add ${unit}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <button
                  onClick={() => {
                    addRecord(type, recordInputs[type], unit)
                    setRecordInputs((prev) => ({ ...prev, [type]: '' }))
                  }}
                  disabled={loading}
                  className="bg-cyan-600 text-white p-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                >
                  <FiPlus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Records */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Today's Records</h3>
          {records.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No records for today</p>
          ) : (
            <div className="space-y-2">
              {records.map((record) => {
                const typeInfo = getRecordTypeInfo(record.record_type)
                const Icon = typeInfo.icon || FiActivity
                return (
                  <div key={record.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <Icon className={`h-4 w-4 mr-3 ${typeInfo.color}`} />
                      <span className="font-medium text-gray-900 capitalize">{record.record_type}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {record.value} {record.unit}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(record.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HealthTracker