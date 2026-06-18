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
  Divider
} from '@mui/material';
import { AccountCircle, Delete, Save } from '@mui/icons-material';
import { updateUser, logout } from '../features/auth/authSlice';
import api from '../services/api';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
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
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mb: 2 }}>
            <AccountCircle sx={{ fontSize: 60 }} />
          </Avatar>
          <Typography variant="h4" fontWeight="bold">
            My Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account settings and preferences
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <form onSubmit={formik.handleSubmit}>
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
          
          <Box sx={{ mt: 3, mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Role: <strong>{user?.role === 'admin' ? 'Administrator' : 'User'}</strong>
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
            disabled={saving || !formik.dirty}
            sx={{ mt: 3, py: 1.5 }}
          >
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </form>

        <Box sx={{ mt: 6, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Danger Zone
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Once you delete your account, there is no going back. Please be certain.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Account
          </Button>
        </Box>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to completely delete your account? This action cannot be undone and you will lose all your saved bookmarks, concepts, and preferences.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount} 
            color="error" 
            variant="contained" 
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
