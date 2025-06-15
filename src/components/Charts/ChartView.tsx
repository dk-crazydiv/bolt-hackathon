import React from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Alert
} from '@mui/material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer
} from 'recharts'
import { useDataStore } from '../../store/dataStore'
import { chartQuestions } from './ChartQuestions'
import { ChartQuestion } from '../../types'

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
  '#ff00ff', '#00ffff', '#ff0000', '#0000ff', '#ffff00'
]

interface ChartComponentProps {
  question: ChartQuestion
  data: any[]
}

const ChartComponent: React.FC<ChartComponentProps> = ({ question, data }) => {
  if (!data || data.length === 0) {
    return (
      <Alert severity="info">
        No data available for this chart
      </Alert>
    )
  }

  const commonProps = {
    width: '100%',
    height: 300,
    data
  }

  switch (question.chartType) {
    case 'bar':
      return (
        <ResponsiveContainer {...commonProps}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={question.xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={question.yKey} fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      )

    case 'pie':
      return (
        <ResponsiveContainer {...commonProps}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      )

    case 'line':
      return (
        <ResponsiveContainer {...commonProps}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={question.xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={question.yKey} stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      )

    case 'area':
      return (
        <ResponsiveContainer {...commonProps}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={question.xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey={question.yKey} stroke="#8884d8" fill="#8884d8" />
          </AreaChart>
        </ResponsiveContainer>
      )

    default:
      return <Alert severity="error">Unknown chart type</Alert>
  }
}

export const ChartView: React.FC = () => {
  const { currentFile } = useDataStore()

  if (!currentFile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No file selected. Please upload a file first.
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Data Insights
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Explore your data through interactive charts and visualizations
      </Typography>

      <Grid container spacing={3}>
        {chartQuestions.map((question) => {
          const chartData = question.dataSelector(currentFile)
          
          return (
            <Grid item xs={12} lg={6} key={question.id}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {question.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {question.description}
                </Typography>
                <ChartComponent question={question} data={chartData} />
              </Paper>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}