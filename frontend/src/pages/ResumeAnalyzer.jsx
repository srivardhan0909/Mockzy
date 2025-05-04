import { useState } from 'react';
import axios from 'axios';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('resume', file);

    const res = await axios.post('http://localhost:3000/api/resume/upload', formData);
    setResult(res.data.analysis);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Upload Resume</h2>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button className="btn btn-primary mt-2" onClick={handleUpload}>Analyze</button>

      {result && (
        <div className="mt-4 bg-gray-100 p-4 rounded shadow">
          <h3 className="font-semibold">Skills Found:</h3>
          <ul>
            {result.skills_found.map((skill, i) => <li key={i}>{skill}</li>)}
          </ul>
          <p className="mt-2 font-medium">Score: {result.score}</p>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
