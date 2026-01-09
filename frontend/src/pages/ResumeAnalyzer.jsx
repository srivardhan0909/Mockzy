import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../utils/api'

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('resume', file)

    try {
      const res = await axios.post(
        `${API_BASE}/resume/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      setResult(res.data.analysis)
      toast.success('Resume analyzed successfully!')
      
      setTimeout(() => {
        navigate('/all-slots')
      }, 1500)
    } catch (error) {
      console.error('Error analyzing resume:', error)
      toast.error(error.response?.data?.message || 'Failed to analyze resume')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">Upload Resume</h2>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        accept=".pdf,.doc,.docx"
      />
      <button
        className={`btn btn-primary mt-2 ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      {result && (
        <div className="p-4 mt-4 bg-gray-100 rounded shadow">
          <h3 className="font-semibold">Skills Found:</h3>
          <ul>
            {result.skills_found.map((skill, i) => (
              <li key={i}>{skill}</li>
            ))}
          </ul>
          <p className="mt-2 font-medium">Score: {result.score}</p>
        </div>
      )}
    </div>
  )
}

export default ResumeAnalyzer