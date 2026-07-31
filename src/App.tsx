import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { LoadingState } from './components/StateViews'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import NotFound from './pages/NotFound'

/**
 * The two detail pages are code-split: their JavaScript is only requested the
 * first time a user opens a project or a task, which keeps the initial bundle
 * to the pages every visitor sees.
 */
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const TaskDetail = lazy(() => import('./pages/TaskDetail'))

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingState label="Loading page…" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<ProjectDetail />} />
          <Route path="/tasks/:taskId" element={<TaskDetail />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}
