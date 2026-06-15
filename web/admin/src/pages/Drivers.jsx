import { useState, useEffect } from 'react';
import { adminAPI } from '../api/admin';
import './Users.css';

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getDrivers();
      setDrivers(data);
      setError('');
    } catch (err) {
      setError('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (driverId) => {
    if (!confirm('Are you sure you want to block this driver?')) return;

    try {
      setActionLoading(driverId);
      await adminAPI.blockDriver(driverId);
      await loadDrivers();
    } catch (err) {
      alert('Failed to block driver');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblock = async (driverId) => {
    try {
      setActionLoading(driverId);
      await adminAPI.unblockDriver(driverId);
      await loadDrivers();
    } catch (err) {
      alert('Failed to unblock driver');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading drivers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-box">{error}</div>
      </div>
    );
  }

  const onlineDrivers = drivers.filter(d => d.is_online && d.is_active).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Drivers</h1>
          <p>Manage driver accounts</p>
        </div>
        <div className="header-stats">
          <div className="header-stat">
            <span className="stat-number">{drivers.length}</span>
            <span className="stat-text">Total Drivers</span>
          </div>
          <div className="header-stat">
            <span className="stat-number" style={{color: '#22C55E'}}>{onlineDrivers}</span>
            <span className="stat-text">Online Now</span>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Vehicle</th>
              <th>Status</th>
              <th>Verified</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">No drivers found</td>
              </tr>
            ) : (
              drivers.map((driver) => (
                <tr key={driver.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-small">{driver.name.charAt(0).toUpperCase()}</div>
                      <span>{driver.name}</span>
                    </div>
                  </td>
                  <td>{driver.phone}</td>
                  <td>
                    {driver.vehicle_number ? (
                      <div>
                        <div style={{fontWeight: 500}}>{driver.vehicle_number}</div>
                        <div style={{fontSize: '12px', color: '#94A3B8'}}>{driver.vehicle_type || 'N/A'}</div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <div style={{display: 'flex', gap: '6px', flexDirection: 'column'}}>
                      <span className={`status-badge ${driver.is_active ? 'active' : 'blocked'}`}>
                        {driver.is_active ? 'Active' : 'Blocked'}
                      </span>
                      {driver.is_active && (
                        <span className={`status-badge ${driver.is_online ? 'online' : 'offline'}`}>
                          {driver.is_online ? 'Online' : 'Offline'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${driver.is_verified ? 'active' : 'pending'}`}>
                      {driver.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td>{formatDate(driver.created_at)}</td>
                  <td>
                    {driver.is_active ? (
                      <button
                        onClick={() => handleBlock(driver.id)}
                        disabled={actionLoading === driver.id}
                        className="action-button danger"
                      >
                        {actionLoading === driver.id ? 'Blocking...' : 'Block'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnblock(driver.id)}
                        disabled={actionLoading === driver.id}
                        className="action-button success"
                      >
                        {actionLoading === driver.id ? 'Unblocking...' : 'Unblock'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Drivers;
