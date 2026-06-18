import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  Divider,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import { AccountCircle, Delete, Save, Bookmark, Note as NoteIcon, History as HistoryIcon } from '@mui/icons-material';
import { updateUser, logout } from '../features/auth/authSlice';
import api from '../services/api';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Tabs state
  const [tabValue, setTabValue] = useState(0);

  // Data state
  const [bookmarks, setBookmarks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      const profileData = response.data.data;
      formik.setValues({
        name: profileData.name || '',
        email: profileData.email || '',
      });
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load profile details');
      setLoading(false);
    }
  };

  const fetchInteractionData = async () => {
    setLoadingData(true);
    try {
      const [bookmarksRes, notesRes, historyRes] = await Promise.all([
        api.get('/bookmarks?limit=50'),
        api.get('/notes?limit=50'),
        api.get('/history?limit=50')
      ]);
      setBookmarks(bookmarksRes.data.data);
      setNotes(notesRes.data.data);
      setHistory(historyRes.data.data);
    } catch (error) {
      console.error('Failed to fetch interactions', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchInteractionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      email: Yup.string().email('Invalid email address').required('Required'),
    }),
    onSubmit: async (values) => {
      setSaving(true);
      try {
        const response = await api.patch('/auth/profile', values);
        dispatch(updateUser(response.data.data));
        toast.success('Profile updated successfully!');
        setEditDialogOpen(false);
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to update profile';
        toast.error(message);
      } finally {
        setSaving(false);
      }
    },
  });

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/auth/profile');
      toast.success('Account deleted successfully');
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Profile Header Card */}
      <Paper 
        elevation={6} 
        sx={{ 
          borderRadius: 4, 
          overflow: 'hidden',
          bgcolor: '#121212', // Dark background
          color: 'white',
          position: 'relative',
          mb: 4
        }}
      >
        {/* Cover Image Area */}
        <Box 
          sx={{ 
            height: 200, 
            width: '100%', 
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80")'
          }} 
        />

        <Box sx={{ px: 4, pb: 4, position: 'relative' }}>
          {/* Avatar (Overlapping) */}
          <Avatar 
            sx={{ 
              width: 120, 
              height: 120, 
              bgcolor: '#1976d2',
              border: '4px solid #121212',
              mt: '-60px',
              mb: 2
            }}
          >
            <AccountCircle sx={{ fontSize: 90 }} />
          </Avatar>

          {/* User Info */}
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {user?.name || 'Unknown User'}
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
            {user?.email} • {user?.role === 'admin' ? 'Administrator' : 'Member'}
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.1)', 
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                textTransform: 'none',
                borderRadius: 2
              }}
              onClick={() => setEditDialogOpen(true)}
            >
              Edit Profile
            </Button>
            <Button 
              variant="outlined" 
              sx={{ 
                borderColor: 'rgba(255,255,255,0.3)', 
                color: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' },
                textTransform: 'none',
                borderRadius: 2
              }}
              onClick={() => toast.info('Settings panel coming soon')}
            >
              Settings
            </Button>
            <Button 
              variant="outlined" 
              color="error"
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                borderColor: 'rgba(211, 47, 47, 0.5)',
                '&:hover': { borderColor: '#d32f2f', bgcolor: 'rgba(211, 47, 47, 0.05)' }
              }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tabs Section */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            <Tab icon={<Bookmark sx={{ mr: 1 }} />} iconPosition="start" label="Bookmarks" />
            <Tab icon={<NoteIcon sx={{ mr: 1 }} />} iconPosition="start" label="Notes" />
            <Tab icon={<HistoryIcon sx={{ mr: 1 }} />} iconPosition="start" label="History" />
          </Tabs>
        </Box>

        {/* Bookmarks Tab */}
        <CustomTabPanel value={tabValue} index={0}>
          {loadingData ? (
            <CircularProgress size={30} />
          ) : bookmarks.length === 0 ? (
            <Typography color="text.secondary">No bookmarks found.</Typography>
          ) : (
            <Grid container spacing={3}>
              {bookmarks.map((bookmark) => (
                <Grid item xs={12} sm={6} key={bookmark._id}>
                  <Card 
                    variant="outlined" 
                    sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
                    onClick={() => navigate(`/concepts/${bookmark.conceptId?._id}`)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom noWrap>
                        {bookmark.conceptId?.title || 'Unknown Concept'}
                      </Typography>
                      <Chip label={bookmark.conceptId?.category || 'General'} size="small" color="primary" variant="outlined" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CustomTabPanel>

        {/* Notes Tab */}
        <CustomTabPanel value={tabValue} index={1}>
          {loadingData ? (
            <CircularProgress size={30} />
          ) : notes.length === 0 ? (
            <Typography color="text.secondary">No notes found.</Typography>
          ) : (
            <Grid container spacing={3}>
              {notes.map((note) => (
                <Grid item xs={12} key={note._id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" color="primary" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/concepts/${note.conceptId?._id}`)}>
                          {note.conceptId?.title || 'Unknown Concept'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {note.content}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CustomTabPanel>

        {/* History Tab */}
        <CustomTabPanel value={tabValue} index={2}>
          {loadingData ? (
            <CircularProgress size={30} />
          ) : history.length === 0 ? (
            <Typography color="text.secondary">No viewing history found.</Typography>
          ) : (
            <Grid container spacing={3}>
              {history.map((item) => (
                <Grid item xs={12} sm={6} key={item._id}>
                  <Card 
                    variant="outlined" 
                    sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
                    onClick={() => navigate(`/concepts/${item.conceptId?._id}`)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" noWrap sx={{ maxWidth: '70%' }}>
                          {item.conceptId?.title || 'Unknown Concept'}
                        </Typography>
                        <Chip label={item.conceptId?.category || 'General'} size="small" variant="outlined" />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Viewed on {new Date(item.viewedAt).toLocaleDateString()} at {new Date(item.viewedAt).toLocaleTimeString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CustomTabPanel>
      </Box>

      {/* Edit Profile Modal */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <form onSubmit={formik.handleSubmit} id="edit-profile-form">
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Full Name"
              margin="normal"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email Address"
              margin="normal"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </form>

          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="h6" color="error" gutterBottom>Danger Zone</Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => { setEditDialogOpen(false); setDeleteDialogOpen(true); }}
            >
              Delete Account
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            type="submit" 
            form="edit-profile-form" 
            variant="contained" 
            disabled={saving || !formik.dirty}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to completely delete your account? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
