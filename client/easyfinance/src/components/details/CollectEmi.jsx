import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';


function CollectEMI({ onLogout }) {
  const { clientId, loanId } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const [formData, setFormData] = useState({
    amountCollected: '',
    status: 'paid',
    location: {
      coordinates: [0, 0],
      address: 'Unknown location'
    }
  });

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/agent/getClientdata/${clientId}`);
        if (response.data.success) {
          setClient(response.data.data);
          const loanData = response.data.data.loans.find(l => l._id === loanId);
          if (loanData) {
            setLoan(loanData);
            setFormData(prev => ({
              ...prev,
              amountCollected: loanData.emiAmount || ''
            }));
          } else {
            setError('Loan not found');
          }
        } else {
          setError(response.data.message || 'Failed to fetch client details');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching client details');
        console.error('Error fetching client:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
    getLocation();
  }, [clientId, loanId]);

  const getLocation = () => {
    if (navigator.geolocation) {
      setGettingLocation(true);
      setLocationError(null);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          try {
            const address = `Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}`;

            setUserLocation({
              coordinates: [coords.lng, coords.lat],
              address
            });

            setFormData(prev => ({
              ...prev,
              location: {
                coordinates: [coords.lng, coords.lat],
                address
              }
            }));
          } catch (err) {
            console.error('Error getting address:', err);
            setUserLocation({
              coordinates: [coords.lng, coords.lat],
              address: 'Location found (address unavailable)'
            });

            setFormData(prev => ({
              ...prev,
              location: {
                coordinates: [coords.lng, coords.lat],
                address: 'Location found (address unavailable)'
              }
            }));
          }

          setGettingLocation(false);
        },
        (err) => {
          setLocationError(`Error getting location: ${err.message}`);
          setGettingLocation(false);
          console.error('Geolocation error:', err);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amountCollected || formData.amountCollected <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await axios.post(`/api/agent/collectemi/${clientId}/${loanId}`, {
        amountCollected: Number(formData.amountCollected),
        status: formData.status,
        location: formData.location
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/client/${clientId}`);
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to collect EMI');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while collecting EMI');
      console.error('Error collecting EMI:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBasedOnAmount = () => {
    if (!loan || !formData.amountCollected) return 'paid';

    const amount = parseFloat(formData.amountCollected);
    const emiAmount = loan.emiAmount || 0;

    if (amount >= emiAmount) return 'paid';
    if (amount > 0) return 'partial';
    return 'missed';
  };

  useEffect(() => {
    if (loan && formData.amountCollected) {
      const status = getStatusBasedOnAmount();
      setFormData(prev => ({ ...prev, status }));
    }
  }, [formData.amountCollected, loan]);

  // ... UI rendering stays unchanged

  return (
    <div className="flex h-screen bg-blue-50">
      <Sidebar activeItem="collections" onLogout={onLogout} />
      {/* The rest of your UI here as in your last version */}
    </div>
  );
}

export default CollectEMI;
