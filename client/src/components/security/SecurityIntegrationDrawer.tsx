/**
 * Security & Integration Drawer
 * Phase 5: Shows RBAC, audit logging, historian integration, and rollout timeline
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { 
  Shield, 
  Database, 
  Network, 
  Users, 
  FileText, 
  CheckCircle,
  Circle,
  Clock,
  ArrowRight,
  Lock,
  Server,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityIntegrationDrawerProps {
  className?: string;
  trigger?: React.ReactNode;
}

export default function SecurityIntegrationDrawer({ 
  className, 
  trigger 
}: SecurityIntegrationDrawerProps) {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  // RBAC Role definitions
  const rbacRoles = [
    {
      role: 'Operator',
      permissions: ['View real-time data', 'Acknowledge alarms', 'Execute approved actions'],
      level: 'Level 1',
      color: 'bg-blue-500'
    },
    {
      role: 'Shift Supervisor',
      permissions: ['All Operator rights', 'Override safety interlocks', 'Modify process parameters'],
      level: 'Level 2', 
      color: 'bg-green-500'
    },
    {
      role: 'Metallurgist',
      permissions: ['All Shift rights', 'Chemistry analysis', 'Recipe modifications', 'Quality control'],
      level: 'Level 3',
      color: 'bg-purple-500'
    },
    {
      role: 'Administrator',
      permissions: ['Full system access', 'User management', 'System configuration', 'Audit management'],
      level: 'Level 4',
      color: 'bg-red-500'
    }
  ];

  // Audit log entries (demo data)
  const auditEntries = [
    {
      timestamp: '2024-01-15 14:32:15',
      user: 'petrov.operator',
      action: 'Power adjustment',
      details: 'Reduced power to 85% on Heat 93378',
      result: 'Success',
      severity: 'normal' as const
    },
    {
      timestamp: '2024-01-15 14:28:03',
      user: 'ivanov.metallurgist',
      action: 'Recipe override',
      details: 'Modified electrode consumption target',
      result: 'Success',
      severity: 'elevated' as const
    },
    {
      timestamp: '2024-01-15 14:15:45',
      user: 'system.ai',
      action: 'Anomaly detection',
      details: 'Foam collapse predicted and mitigated',
      result: 'Automated',
      severity: 'critical' as const
    }
  ];

  // Network zones configuration
  const networkZones = [
    {
      zone: 'DMZ',
      description: 'I-MELT dashboard and reporting interfaces',
      isolation: 'Firewall protected',
      access: 'Management network only'
    },
    {
      zone: 'Control Network', 
      description: 'PLC and SCADA integration layer',
      isolation: 'Air-gapped from corporate network',
      access: 'Read-only historian data'
    },
    {
      zone: 'Process Network',
      description: 'Direct furnace instrumentation',
      isolation: 'Physically isolated',
      access: 'No external connectivity'
    }
  ];

  // 12-week rollout timeline
  const rolloutWeeks = [
    { week: 1, title: 'Planning & Assessment', status: 'completed', tasks: ['Site survey', 'Network assessment', 'Security audit'] },
    { week: 2, title: 'Infrastructure Setup', status: 'completed', tasks: ['DMZ configuration', 'Firewall rules', 'VPN setup'] },
    { week: 3, title: 'Historian Integration', status: 'completed', tasks: ['OPC-UA client setup', 'Data validation', 'Backup procedures'] },
    { week: 4, title: 'Basic Dashboard', status: 'current', tasks: ['Heat data display', 'Real-time updates', 'User authentication'] },
    { week: 5, title: 'AI Model Training', status: 'planned', tasks: ['Historical data analysis', 'Model validation', 'Performance tuning'] },
    { week: 6, title: 'Predictive Analytics', status: 'planned', tasks: ['Anomaly detection', 'Process optimization', 'Alert configuration'] },
    { week: 7, title: 'Advanced Features', status: 'planned', tasks: ['ROI calculations', 'Reporting system', 'Mobile access'] },
    { week: 8, title: 'User Training Phase 1', status: 'planned', tasks: ['Operator training', 'Basic workflows', 'Safety procedures'] },
    { week: 9, title: 'User Training Phase 2', status: 'planned', tasks: ['Advanced features', 'Troubleshooting', 'Emergency procedures'] },
    { week: 10, title: 'Performance Validation', status: 'planned', tasks: ['System testing', 'Load testing', 'Security testing'] },
    { week: 11, title: 'Go-Live Preparation', status: 'planned', tasks: ['Final validation', 'Backup procedures', 'Rollback plan'] },
    { week: 12, title: 'Production Deployment', status: 'planned', tasks: ['Live deployment', 'Monitoring setup', 'Support handover'] }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'current': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'planned': return <Circle className="w-4 h-4 text-gray-400" />;
      default: return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'elevated': return 'text-orange-600 bg-orange-50';
      case 'normal': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild className={className}>
        {trigger || (
          <Button variant="outline" size="sm">
            <Shield className="w-4 h-4 mr-2" />
            Security & Integration
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Security & Integration Overview
          </DrawerTitle>
          <DrawerDescription>
            RBAC configuration, audit logging, network security, and deployment timeline for I-MELT system
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 py-2 overflow-y-auto space-y-6">
          {/* RBAC Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Role-Based Access Control (RBAC)
              </CardTitle>
              <CardDescription>
                Four-tier permission system aligned with operational hierarchy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rbacRoles.map((role) => (
                  <div key={role.role} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn("w-3 h-3 rounded-full", role.color)} />
                      <div>
                        <h4 className="font-medium">{role.role}</h4>
                        <p className="text-sm text-gray-600">{role.level}</p>
                      </div>
                    </div>
                    <ul className="space-y-1">
                      {role.permissions.map((perm, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                          {perm}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Network Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                Network Security Architecture
              </CardTitle>
              <CardDescription>
                Multi-zone network isolation with air-gap protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {networkZones.map((zone, index) => (
                  <div key={zone.zone} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm",
                        index === 0 ? 'bg-green-500' : index === 1 ? 'bg-yellow-500' : 'bg-red-500'
                      )}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{zone.zone}</h4>
                      <p className="text-sm text-gray-600 mb-2">{zone.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          {zone.isolation}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          {zone.access}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Historian Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Historian → OPC-UA Integration
              </CardTitle>
              <CardDescription>
                Read-only data integration from existing process historian
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-800">OPC-UA Client Configured</h4>
                      <p className="text-sm text-green-700">Secure connection to process historian established</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600 text-white">Active</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Protocol:</span> OPC-UA with security
                  </div>
                  <div>
                    <span className="font-medium">Data Rate:</span> 1Hz (real-time)
                  </div>
                  <div>
                    <span className="font-medium">Access:</span> Read-only, historian buffer
                  </div>
                  <div>
                    <span className="font-medium">Backup:</span> Local 7-day buffer
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logging */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Audit Log (Recent Activity)
              </CardTitle>
              <CardDescription>
                Real-time tracking of all system interactions and AI decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditEntries.map((entry, index) => (
                  <div key={index} className={cn("p-3 rounded-lg border-l-4", 
                    entry.severity === 'critical' ? 'border-red-500 bg-red-50' :
                    entry.severity === 'elevated' ? 'border-orange-500 bg-orange-50' :
                    'border-blue-500 bg-blue-50'
                  )}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-sm">{entry.action}</h4>
                        <p className="text-xs text-gray-600">{entry.user}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={cn("text-xs", getSeverityColor(entry.severity))}>
                          {entry.result}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{entry.timestamp}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{entry.details}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rollout Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                12-Week Rollout Timeline
              </CardTitle>
              <CardDescription>
                Phased deployment schedule with weekly milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rolloutWeeks.map((week) => (
                  <div 
                    key={week.week}
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
                      selectedWeek === week.week ? "ring-2 ring-blue-500" : "",
                      week.status === 'completed' ? "bg-green-50 border-green-200" :
                      week.status === 'current' ? "bg-blue-50 border-blue-200" :
                      "bg-gray-50 border-gray-200"
                    )}
                    onClick={() => setSelectedWeek(selectedWeek === week.week ? null : week.week)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(week.status)}
                      <div>
                        <h4 className="font-medium text-sm">Week {week.week}</h4>
                        <Badge variant="outline" className="text-xs mt-1">
                          {week.status}
                        </Badge>
                      </div>
                    </div>
                    <h5 className="font-medium mb-2">{week.title}</h5>
                    {selectedWeek === week.week && (
                      <ul className="space-y-1">
                        {week.tasks.map((task, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <ArrowRight className="w-3 h-3" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">Current Status: Week 4</h4>
                    <p className="text-sm text-blue-700">
                      Basic dashboard functionality implemented. Next phase: AI model training begins Week 5.
                      All security and network isolation measures are operational.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DrawerFooter>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Security Status: <Badge className="bg-green-600 text-white ml-1">Compliant</Badge>
            </div>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}