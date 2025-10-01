"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, Info, RefreshCw, Target, FileText, BarChart3, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

interface Issue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  property?: string;
  line?: number;
  column?: number;
}

interface IssueDetail {
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  column?: number;
  property?: string;
  value?: string;  // FIXED: Added missing property
  api?: string;
  feature?: string;
  support?: Record<string, string | boolean>;
  baseline?: string | boolean;  // FIXED: Added missing property
}

interface FileIssue {
  name: string;
  status: 'good' | 'warning' | 'error';
  score: number;
  issues: number;
  details?: IssueDetail[];
}

interface DashboardData {
  score: number;
  totalFiles: number;
  cssFiles: number;
  jsFiles: number;
  lastScan: string;
  criticalIssues: number;
  warnings: number;
  infoIssues: number;
  cleanFiles: number;
  recentFiles: FileIssue[];
}

// Fetch real data from baseline-lint API
const fetchBaselineLintData = async (path: string): Promise<DashboardData> => {
  try {
    const response = await fetch(`/api/scan?path=${encodeURIComponent(path)}`, {
      cache: 'no-store', // Always get fresh data
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Convert ISO string to locale string for display
    return {
      ...data,
      lastScan: new Date(data.lastScan).toLocaleString(),
    };
  } catch (error) {
    console.error('Failed to fetch baseline-lint data:', error);
    // Return fallback data if API fails
    return {
      score: 0,
      totalFiles: 0,
      cssFiles: 0,
      jsFiles: 0,
      lastScan: new Date().toLocaleString(),
      criticalIssues: 0,
      warnings: 0,
      infoIssues: 0,
      cleanFiles: 0,
      recentFiles: [],
    };
  }
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanPath, setScanPath] = useState('test/integration/test-project/src');
  const [showPathDialog, setShowPathDialog] = useState(false);
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState<Record<number, boolean>>({});
  const [issueFilter, setIssueFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const dashboardData = await fetchBaselineLintData(scanPath);
        setData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [scanPath]);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboardData = await fetchBaselineLintData(scanPath);
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
      console.error('Error refreshing dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 90) return "default";
    if (score >= 70) return "secondary";
    return "destructive";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground">
                {data ? 'Refreshing data...' : 'Running baseline-lint scan...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Data</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={refreshData} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="h-8 w-8 text-blue-600" />
              Baseline Lint Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Real-time web compatibility monitoring • Last scan: {data.lastScan}
            </p>
          </div>
          <Button 
            onClick={refreshData} 
            variant="outline" 
            className="gap-2"
            disabled={loading}
            aria-label="Refresh dashboard data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Scanning...' : 'Refresh'}
          </Button>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Overall Score */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                <span className={getScoreColor(data.score)}>{data.score}/100</span>
              </div>
              <Progress value={data.score} className="mb-2" />
              <p className="text-xs text-muted-foreground">
                {data.score >= 90 ? '🎉 Excellent!' : data.score >= 70 ? '⚠️ Good' : '🚨 Needs attention'}
              </p>
            </CardContent>
          </Card>

          {/* Total Files */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalFiles}</div>
              <p className="text-xs text-muted-foreground">
                {data.cssFiles} CSS • {data.jsFiles} JS
              </p>
            </CardContent>
          </Card>

          {/* Critical Issues */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{data.criticalIssues}</div>
              <p className="text-xs text-muted-foreground">
                {data.warnings} warnings • {data.infoIssues} info
              </p>
            </CardContent>
          </Card>

          {/* Clean Files */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clean Files</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{data.cleanFiles}</div>
              <p className="text-xs text-muted-foreground">
                {data.totalFiles > 0 ? Math.round((data.cleanFiles / data.totalFiles) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Files Analysis */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent File Analysis
            </CardTitle>
            <CardDescription>
              Latest files analyzed with their compatibility scores
            </CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Filter issues by:</span>
              <div className="flex" role="group" aria-label="Filter issues by severity">
                <Button 
                  size="sm" 
                  variant={issueFilter === 'all' ? "default" : "outline"}
                  className="text-xs h-7 px-2 rounded-r-none"
                  onClick={() => setIssueFilter('all')}
                  aria-pressed={issueFilter === 'all'}
                >
                  All
                </Button>
                <Button 
                  size="sm" 
                  variant={issueFilter === 'error' ? "default" : "outline"}
                  className="text-xs h-7 px-2 rounded-none border-l-0"
                  onClick={() => setIssueFilter('error')}
                  aria-pressed={issueFilter === 'error'}
                >
                  Errors
                </Button>
                <Button 
                  size="sm" 
                  variant={issueFilter === 'warning' ? "default" : "outline"}
                  className="text-xs h-7 px-2 rounded-none border-l-0"
                  onClick={() => setIssueFilter('warning')}
                  aria-pressed={issueFilter === 'warning'}
                >
                  Warnings
                </Button>
                <Button 
                  size="sm" 
                  variant={issueFilter === 'info' ? "default" : "outline"}
                  className="text-xs h-7 px-2 rounded-l-none border-l-0"
                  onClick={() => setIssueFilter('info')}
                  aria-pressed={issueFilter === 'info'}
                >
                  Info
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...data.recentFiles]
                // Sort by severity (error > warning > good) then by score (lowest first)
                .sort((a, b) => {
                  // First by status/severity
                  if (a.status === 'error' && b.status !== 'error') return -1;
                  if (a.status !== 'error' && b.status === 'error') return 1;
                  if (a.status === 'warning' && b.status === 'good') return -1;
                  if (a.status === 'good' && b.status === 'warning') return 1;
                  
                  // Then by score (ascending - lowest/worst score first)
                  return a.score - b.score;
                })
                .map((file, index) => {
                const isExpanded = expandedFiles[index] || false;
                
                return (
                <div key={index} className="rounded-lg bg-gray-50 dark:bg-gray-700 overflow-hidden">
                  <div 
                    onClick={() => setExpandedFiles(prev => ({...prev, [index]: !prev[index]}))}
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedFiles(prev => ({...prev, [index]: !prev[index]}));
                      }
                    }}
                    aria-expanded={isExpanded}
                    aria-label={`${file.name}, ${file.issues} issue${file.issues !== 1 ? 's' : ''}, score ${file.score}/100. Click to ${isExpanded ? 'collapse' : 'expand'} details.`}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(file.status)}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {file.issues} issue{file.issues !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getScoreBadgeVariant(file.score)}>
                        {file.score}/100
                      </Badge>
                      {isExpanded ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                    </div>
                  </div>
                  
                  {isExpanded && file.details && (
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600">
                      <h4 className="font-semibold text-sm mb-2">Issue Details:</h4>
                      {file.details.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No issues found for this file.</p>
                      ) : file.details.filter(issue => issueFilter === 'all' || issue.severity === issueFilter).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No issues match the current filter.</p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {file.details
                            .filter(issue => issueFilter === 'all' || issue.severity === issueFilter)
                            .map((issue, issueIndex) => (
                            <div 
                              key={issueIndex} 
                              className={`p-2 rounded text-sm ${
                                issue.severity === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300' :
                                issue.severity === 'warning' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' :
                                'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {issue.severity === 'error' && <AlertTriangle className="h-4 w-4" />}
                                {issue.severity === 'warning' && <AlertTriangle className="h-4 w-4" />}
                                {issue.severity === 'info' && <Info className="h-4 w-4" />}
                                <span className="font-medium capitalize">{issue.severity}:</span> {issue.message}
                              </div>
                              {(issue.line || issue.property || issue.api || issue.feature) && (
                                <div className="mt-1 text-xs opacity-80 pl-6">
                                  {issue.property && <span>Property: <code>{issue.property}</code> • </span>}
                                  {issue.api && <span>API: <code>{issue.api}</code> • </span>}
                                  {issue.feature && <span>Feature: {issue.feature} • </span>}
                                  {issue.line && <span>Line: {issue.line}{issue.column ? `, Column: ${issue.column}` : ''}</span>}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )})}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks and useful links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                className="justify-start gap-2" 
                variant="outline"
                onClick={() => setShowPathDialog(true)}
              >
                <RefreshCw className="h-4 w-4" />
                Run New Scan
              </Button>
              <Button 
                className="justify-start gap-2" 
                variant="outline"
                onClick={() => setShowLogDetails(true)}
              >
                <FileText className="h-4 w-4" />
                View Full Details
              </Button>
              <Button 
                className="justify-start gap-2" 
                variant="outline"
                onClick={() => {
                  // Export data as JSON file with details
                  if (!data) return;
                  
                  // Create detailed export with all issues
                  const exportData = {
                    summary: {
                      score: data.score,
                      totalFiles: data.totalFiles,
                      cssFiles: data.cssFiles,
                      jsFiles: data.jsFiles,
                      lastScan: data.lastScan,
                      criticalIssues: data.criticalIssues,
                      warnings: data.warnings,
                      infoIssues: data.infoIssues,
                      cleanFiles: data.cleanFiles
                    },
                    files: data.recentFiles.map(file => ({
                      name: file.name,
                      score: file.score,
                      status: file.status,
                      issueCount: file.issues,
                      issues: file.details || []
                    }))
                  };
                  
                  const json = JSON.stringify(exportData, null, 2);
                  const blob = new Blob([json], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `baseline-lint-report-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              >
                <BarChart3 className="h-4 w-4" />
                Export Report
              </Button>
              <Button className="justify-start gap-2" variant="outline" asChild>
                <a href="https://github.com/TAGOOZ/baseline-lint" target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4" />
                  Documentation
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Path Dialog */}
        {showPathDialog && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-labelledby="path-dialog-title"
            aria-modal="true"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
              <div className="flex justify-between items-center mb-2">
                <h3 id="path-dialog-title" className="text-lg font-semibold">Select Path to Scan</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowPathDialog(false)}
                  aria-label="Close dialog"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                Choose a directory to scan for compatibility issues
              </p>
              
              {/* Path Input */}
              <div className="mb-4">
                <label htmlFor="scan-path-input" className="block text-sm font-medium mb-2">
                  Scan Path
                </label>
                <input 
                  id="scan-path-input"
                  type="text"
                  value={scanPath}
                  onChange={(e) => setScanPath(e.target.value)}
                  className="w-full p-2 border rounded bg-transparent"
                  placeholder="e.g., src, test/integration/test-project/src"
                  aria-label="Scan path"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the relative path to scan, or select from suggested paths below
                </p>
              </div>
              
              {/* Suggested Paths */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Suggested Paths:</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant="ghost" 
                    className="justify-start text-sm h-auto py-1.5"
                    onClick={() => setScanPath('src')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M3 3v18h18" />
                      <path d="m18 3-8.5 8.5-4-4L3 10" />
                    </svg>
                    Main Source Directory <span className="text-xs opacity-60 ml-1">(src)</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="justify-start text-sm h-auto py-1.5"
                    onClick={() => setScanPath('test/integration/test-project/src')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    Test Project <span className="text-xs opacity-60 ml-1">(test/integration/test-project/src)</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="justify-start text-sm h-auto py-1.5"
                    onClick={() => setScanPath('baseline-dashboard/src')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                      <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                      <path d="M12 3v6" />
                    </svg>
                    Dashboard Source <span className="text-xs opacity-60 ml-1">(baseline-dashboard/src)</span>
                  </Button>
                </div>
              </div>
              
              {/* Scan Options */}
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded mb-4">
                <h4 className="text-sm font-medium mb-2">Scan Options:</h4>
                <div className="flex items-center mb-2">
                  <input 
                    type="checkbox" 
                    id="recursive-scan" 
                    className="mr-2" 
                    defaultChecked 
                  />
                  <label htmlFor="recursive-scan" className="text-sm">Include subdirectories</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="include-node-modules" 
                    className="mr-2" 
                  />
                  <label htmlFor="include-node-modules" className="text-sm">Include node_modules (not recommended)</label>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPathDialog(false)}>Cancel</Button>
                <Button onClick={() => {
                  setShowPathDialog(false);
                  refreshData();
                }}>Scan</Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Detailed Logs Dialog - GitHub Style */}
        {showLogDetails && data && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-labelledby="log-details-title"
            aria-modal="true"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-5xl w-full max-h-[85vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 id="log-details-title" className="text-lg font-semibold flex items-center">
                  <Target className="h-5 w-5 text-blue-600 mr-2" />
                  Baseline Lint Report
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowLogDetails(false)}
                  aria-label="Close dialog"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </Button>
              </div>
              
              {/* GitHub-like header summary box */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-md mb-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <div className="mr-3">
                    {data.score >= 90 ? (
                      <div className="bg-green-500 text-white rounded-full p-1.5">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    ) : data.score >= 70 ? (
                      <div className="bg-yellow-500 text-white rounded-full p-1.5">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="bg-red-500 text-white rounded-full p-1.5">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">Baseline Compatibility Score: <span className={getScoreColor(data.score)}>{data.score}/100</span></h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Scanned {data.totalFiles} files • Last updated: {data.lastScan}
                    </p>
                  </div>
                </div>
                <div className="p-4 text-sm">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="font-semibold mb-1">Files Analyzed</div>
                      <div>{data.totalFiles} total files</div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>CSS: {data.cssFiles}</span>
                        <span>JS: {data.jsFiles}</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Compatibility</div>
                      <div className="flex items-center">
                        <Progress value={data.totalFiles > 0 ? (data.cleanFiles / data.totalFiles) * 100 : 0} className="h-2 mr-2" />
                        <span>{data.cleanFiles} clean</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {data.totalFiles > 0 ? Math.round((data.cleanFiles / data.totalFiles) * 100) : 0}% compatible
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Issues Found</div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-red-500 mr-1"></div>
                          <span>{data.criticalIssues}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-yellow-500 mr-1"></div>
                          <span>{data.warnings}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-blue-500 mr-1"></div>
                          <span>{data.infoIssues}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {data.criticalIssues + data.warnings + data.infoIssues} total issues
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Scan Path</div>
                      <div className="text-sm font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded overflow-hidden text-ellipsis">
                        {scanPath}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Filter tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <div className="flex space-x-1" role="tablist" aria-label="Issue severity filter">
                  <button 
                    onClick={() => setIssueFilter('all')}
                    className={`px-4 py-2 text-sm font-medium ${
                      issueFilter === 'all' 
                        ? 'border-b-2 border-blue-500 text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    role="tab"
                    aria-selected={issueFilter === 'all'}
                  >
                    All Issues ({data.criticalIssues + data.warnings + data.infoIssues})
                  </button>
                  <button 
                    onClick={() => setIssueFilter('error')}
                    className={`px-4 py-2 text-sm font-medium ${
                      issueFilter === 'error' 
                        ? 'border-b-2 border-red-500 text-red-600' 
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    role="tab"
                    aria-selected={issueFilter === 'error'}
                  >
                    Errors ({data.criticalIssues})
                  </button>
                  <button 
                    onClick={() => setIssueFilter('warning')}
                    className={`px-4 py-2 text-sm font-medium ${
                      issueFilter === 'warning' 
                        ? 'border-b-2 border-yellow-500 text-yellow-600' 
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    role="tab"
                    aria-selected={issueFilter === 'warning'}
                  >
                    Warnings ({data.warnings})
                  </button>
                  <button 
                    onClick={() => setIssueFilter('info')}
                    className={`px-4 py-2 text-sm font-medium ${
                      issueFilter === 'info' 
                        ? 'border-b-2 border-blue-500 text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    role="tab"
                    aria-selected={issueFilter === 'info'}
                  >
                    Info ({data.infoIssues})
                  </button>
                </div>
              </div>

              {(data.criticalIssues + data.warnings + data.infoIssues) === 0 ? (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md text-center py-8">
                  <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">All files passed!</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    No compatibility issues were found in the scanned files.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {data.recentFiles
                    .filter(file => {
                      // Only show files that have details and match the current filter
                      if (!file.details || file.details.length === 0) return false;
                      if (issueFilter === 'all') return true;
                      return file.details.some(issue => issue.severity === issueFilter);
                    })
                    .map((file, fileIndex) => (
                      <div key={fileIndex} className="border border-gray-200 dark:border-gray-700 rounded-md mb-4 overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium flex items-center gap-2">
                            {getStatusIcon(file.status)}
                            {file.name}
                            <Badge variant={getScoreBadgeVariant(file.score)} className="ml-auto">
                              {file.score}/100
                            </Badge>
                          </h4>
                        </div>

                        <div className="p-4">
                          {file.details && file.details
                            .filter(issue => issueFilter === 'all' || issue.severity === issueFilter)
                            .map((issue, issueIndex) => {
                              // Generate priority icon based on severity
                              const getPriorityIcon = () => {
                                if (issue.severity === 'error' || typeof issue.baseline === 'boolean' && !issue.baseline) {
                                  return '🔴';
                                } else if (issue.severity === 'warning' || issue.baseline === 'low') {
                                  return '🟡';
                                } else {
                                  return '🔵';
                                }
                              };

                              // Generate feature text
                              const getFeatureText = () => {
                                if (issue.property) {
                                  return issue.value ? `${issue.property}: ${issue.value}` : issue.property;
                                } else if (issue.api) {
                                  return issue.api;
                                } else if (issue.feature) {
                                  return issue.feature;
                                }
                                return '';
                              };

                              // Generate fix suggestion based on issue properties
                              const getFixSuggestion = () => {
                                const type = file.name.endsWith('.css') ? 'css' : 'js';

                                const suggestions: Record<string, string> = {
                                  // CSS fix suggestions
                                  'word-break': 'Use `word-break: break-word` for wider support',
                                  'container-type': 'Add fallback: `width: 100%; container-type: inline-size;`',
                                  'container-query': 'Use media queries as fallback for older browsers',
                                  'backdrop-filter': 'Add `-webkit-backdrop-filter` prefix for Safari support',
                                  'aspect-ratio': 'Use padding-bottom hack: `padding-bottom: 56.25%; /* 16:9 */`',

                                  // JavaScript fix suggestions
                                  'Array.prototype.at': 'Use `arr[arr.length - 1]` instead of `arr.at(-1)`',
                                  'Array.prototype.findLast': 'Use `[...arr].reverse().find()` for older browsers',
                                  'Object.hasOwn': 'Use `Object.prototype.hasOwnProperty.call(obj, prop)`',
                                  'String.prototype.replaceAll': 'Use `str.replace(/pattern/g, replacement)`',
                                  'Promise.allSettled': 'Use Promise.all with .catch() for each promise',
                                  'structuredClone': 'Use `JSON.parse(JSON.stringify())` or a deep clone library',
                                  'AbortController': 'Add polyfill or use setTimeout/clearTimeout pattern',
                                  'ResizeObserver': 'Add polyfill or use window resize events',
                                  'IntersectionObserver': 'Add polyfill or use scroll event listeners',
                                };

                                if (type === 'css' && issue.property && suggestions[issue.property]) {
                                  return suggestions[issue.property];
                                } else if (type === 'js' && issue.api && suggestions[issue.api]) {
                                  return suggestions[issue.api];
                                }

                                // Generic suggestions based on baseline status
                                if (typeof issue.baseline === 'boolean' && !issue.baseline) {
                                  return type === 'css'
                                    ? 'Consider using widely supported alternatives'
                                    : 'Add polyfill or use alternative implementation';
                                } else if (issue.baseline === 'low') {
                                  return 'Consider adding fallback for older browsers';
                                }

                                return 'Review browser support requirements';
                              };

                              // Generate browser support text
                              const getBrowserSupport = () => {
                                if (!issue.support) return null;

                                const browserNames: Record<string, string> = {
                                  chrome: 'Chrome',
                                  firefox: 'Firefox',
                                  safari: 'Safari',
                                  edge: 'Edge',
                                  ie: 'Internet Explorer'
                                };

                                const supported: string[] = [];
                                const unsupported: string[] = [];

                                Object.entries(issue.support || {}).forEach(([browser, version]) => {
                                  const name = browserNames[browser as keyof typeof browserNames] || browser;
                                  // Check if version has a truthy value that represents support
                                  if (version && version !== 'false') {
                                    supported.push(`${name} ${version}+`);
                                  } else {
                                    unsupported.push(name);
                                  }
                                });

                                if (unsupported.length > 0) {
                                  return `❌ Missing: ${unsupported.join(', ')}`;
                                } else if (supported.length > 0) {
                                  return `✅ ${supported.join(', ')}`;
                                }

                                return null;
                              };

                              const priorityIcon = getPriorityIcon();
                              const featureText = getFeatureText();
                              const fixSuggestion = getFixSuggestion();
                              const browserSupport = getBrowserSupport();

                              return (
                                <div
                                  key={`${fileIndex}-${issueIndex}`}
                                  className={`mb-3 p-3 rounded-md ${
                                    issue.severity === 'error' ? 'bg-red-50 dark:bg-red-900/20' :
                                    issue.severity === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                                    'bg-blue-50 dark:bg-blue-900/20'
                                  }`}
                                >
                                  <h4 className="font-medium mb-2">
                                    {priorityIcon} <strong className="font-mono text-sm">{file.name}:{issue.line || '?'}{issue.column ? `:${issue.column}` : ''}</strong>
                                  </h4>

                                  <ul className="list-disc pl-6 space-y-1 my-2">
                                    {featureText && (
                                      <li><code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">{featureText}</code></li>
                                    )}
                                    <li>{issue.message}</li>
                                    {browserSupport && (
                                      <li>{browserSupport}</li>
                                    )}
                                    <li><strong>Fix:</strong> {fixSuggestion}</li>
                                  </ul>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                    ))}
                </div>
              )}

              <div className="border-t pt-4 mt-4 border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-2">Quick Actions</h3>
                <ul className="list-none pl-0 space-y-1">
                  <li>📊 <a href="https://web.dev/baseline/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">View detailed baseline guide</a></li>
                  <li>🔧 Fix locally: <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">npx baseline-lint check ./src --score</code></li>
                  <li>📚 <a href="https://github.com/web-platform-dx/web-features" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Learn about Baseline</a></li>
                </ul>

                <p className="text-sm text-gray-500 mt-4">
                  <em>🤖 Generated by <a href="https://www.npmjs.com/package/baseline-lint" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">baseline-lint</a></em>
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setShowLogDetails(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            Powered by <strong>baseline-lint</strong> • Real-time scanning • Last updated: {data.lastScan}
          </p>
        </div>
      </div>
    </div>
  );
}