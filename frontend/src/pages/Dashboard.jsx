import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  Pagination,
  MenuItem,
  CircularProgress,
  Chip,
  InputAdornment
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchStart, fetchSuccess, fetchFailure } from '../features/concepts/conceptSlice';
import api from '../services/api';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { concepts, pagination, loading } = useSelector((state) => state.concepts);
  
  const [params, setParams] = useState({
    page: 1,
    limit: 12,
    search: '',
    category: '',
    difficulty: ''
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.data);
      } catch {
        console.error('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchConcepts = async () => {
      dispatch(fetchStart());
      try {
        const response = await api.get('/concepts', { params });
        dispatch(fetchSuccess({
          concepts: response.data.data,
          pagination: response.data.pagination
        }));
      } catch (error) {
        dispatch(fetchFailure(error.message));
      }
    };
    fetchConcepts();
  }, [dispatch, params]);

  const handlePageChange = (event, value) => {
    setParams({ ...params, page: value });
  };

  const handleSearch = (e) => {
    setParams({ ...params, search: e.target.value, page: 1 });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        System Design Knowledge Base
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search concepts..."
          variant="outlined"
          size="small"
          sx={{ flexGrow: 1 }}
          value={params.search}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                  <Search />
                </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          label="Category"
          size="small"
          sx={{ minWidth: 150 }}
          value={params.category}
          onChange={(e) => setParams({ ...params, category: e.target.value, page: 1 })}
        >
          <MenuItem value="">All</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </TextField>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {concepts.map((concept) => (
              <Grid item xs={12} sm={6} md={4} key={concept._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 6 }
                  }}
                  onClick={() => navigate(`/concepts/${concept._id}`)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip label={concept.category} size="small" color="primary" variant="outlined" />
                      <Typography variant="caption" color="text.secondary">
                        {concept.difficulty}
                      </Typography>
                    </Box>
                    <Typography variant="h6" component="div" gutterBottom>
                      {concept.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {concept.prompt}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Pagination 
              count={pagination.totalPages} 
              page={params.page} 
              onChange={handlePageChange} 
              color="primary" 
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default Dashboard;
