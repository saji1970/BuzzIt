import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native';

interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'failed_login' | 'suspicious_activity' | 'data_breach' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  details: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  lastSecurityCheck: Date;
  riskScore: number;
  recommendations: string[];
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private readonly MAX_EVENTS = 1000;
  private readonly CRITICAL_THRESHOLD = 5;
  private readonly RISK_SCORE_THRESHOLD = 70;

  // Log security event
  async logSecurityEvent(
    type: SecurityEvent['type'],
    severity: SecurityEvent['severity'],
    details: string,
    userId?: string
  ): Promise<void> {
    try {
      const event: SecurityEvent = {
        id: this.generateEventId(),
        type,
        severity,
        timestamp: new Date(),
        details,
        userId
      };

      this.events.push(event);

      // Keep only recent events
      if (this.events.length > this.MAX_EVENTS) {
        this.events = this.events.slice(-this.MAX_EVENTS);
      }

      // Store in persistent storage
      await this.storeSecurityEvents();

      // Check for critical patterns
      await this.checkCriticalPatterns();

      // Update risk score
      await this.updateRiskScore();

    } catch (error) {
      console.error('Log security event failed:', error);
    }
  }

  // Generate unique event ID
  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Store security events
  private async storeSecurityEvents(): Promise<void> {
    try {
      await AsyncStorage.setItem('security_events', JSON.stringify(this.events));
    } catch (error) {
      console.error('Store security events failed:', error);
    }
  }

  // Load security events
  private async loadSecurityEvents(): Promise<void> {
    try {
      const events = await AsyncStorage.getItem('security_events');
      if (events) {
        this.events = JSON.parse(events).map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }));
      }
    } catch (error) {
      console.error('Load security events failed:', error);
    }
  }

  // Check for critical security patterns
  private async checkCriticalPatterns(): Promise<void> {
    const recentEvents = this.events.filter(
      event => Date.now() - event.timestamp.getTime() < 300000 // Last 5 minutes
    );

    // Check for multiple failed logins
    const failedLogins = recentEvents.filter(
      event => event.type === 'failed_login'
    );

    if (failedLogins.length >= this.CRITICAL_THRESHOLD) {
      await this.triggerSecurityAlert('Multiple failed login attempts detected');
    }

    // Check for suspicious activity
    const suspiciousActivity = recentEvents.filter(
      event => event.type === 'suspicious_activity'
    );

    if (suspiciousActivity.length >= 3) {
      await this.triggerSecurityAlert('High level of suspicious activity detected');
    }

    // Check for data breach attempts
    const dataBreachAttempts = recentEvents.filter(
      event => event.type === 'data_breach'
    );

    if (dataBreachAttempts.length >= 1) {
      await this.triggerSecurityAlert('Potential data breach attempt detected');
    }
  }

  // Trigger security alert
  private async triggerSecurityAlert(message: string): Promise<void> {
    try {
      await this.logSecurityEvent('suspicious_activity', 'high', message);
      
      Alert.alert(
        'Security Alert',
        message,
        [
          {
            text: 'OK',
            onPress: () => console.log('Security alert acknowledged')
          }
        ]
      );
    } catch (error) {
      console.error('Trigger security alert failed:', error);
    }
  }

  // Update risk score
  private async updateRiskScore(): Promise<void> {
    try {
      const recentEvents = this.events.filter(
        event => Date.now() - event.timestamp.getTime() < 3600000 // Last hour
      );

      let riskScore = 0;

      // Calculate risk based on event types and severity
      for (const event of recentEvents) {
        switch (event.severity) {
          case 'low':
            riskScore += 5;
            break;
          case 'medium':
            riskScore += 15;
            break;
          case 'high':
            riskScore += 30;
            break;
          case 'critical':
            riskScore += 50;
            break;
        }
      }

      // Check for patterns that increase risk
      const failedLogins = recentEvents.filter(
        event => event.type === 'failed_login'
      );
      if (failedLogins.length > 3) {
        riskScore += 20;
      }

      const suspiciousActivity = recentEvents.filter(
        event => event.type === 'suspicious_activity'
      );
      if (suspiciousActivity.length > 2) {
        riskScore += 25;
      }

      // Cap risk score at 100
      riskScore = Math.min(riskScore, 100);

      // Store risk score
      await AsyncStorage.setItem('risk_score', riskScore.toString());

      // Check if risk score exceeds threshold
      if (riskScore >= this.RISK_SCORE_THRESHOLD) {
        await this.triggerHighRiskAlert(riskScore);
      }

    } catch (error) {
      console.error('Update risk score failed:', error);
    }
  }

  // Trigger high risk alert
  private async triggerHighRiskAlert(riskScore: number): Promise<void> {
    try {
      Alert.alert(
        'High Risk Detected',
        `Your account security risk score is ${riskScore}%. Please review your security settings.`,
        [
          {
            text: 'Review Security',
            onPress: () => console.log('Navigate to security settings')
          },
          {
            text: 'Dismiss',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Trigger high risk alert failed:', error);
    }
  }

  // Get security metrics
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    try {
      await this.loadSecurityEvents();

      const totalEvents = this.events.length;
      const criticalEvents = this.events.filter(
        event => event.severity === 'critical'
      ).length;

      const riskScore = parseInt(await AsyncStorage.getItem('risk_score') || '0');
      const lastSecurityCheck = new Date();

      const recommendations = this.generateSecurityRecommendations(riskScore);

      return {
        totalEvents,
        criticalEvents,
        lastSecurityCheck,
        riskScore,
        recommendations
      };
    } catch (error) {
      console.error('Get security metrics failed:', error);
      return {
        totalEvents: 0,
        criticalEvents: 0,
        lastSecurityCheck: new Date(),
        riskScore: 0,
        recommendations: []
      };
    }
  }

  // Generate security recommendations
  private generateSecurityRecommendations(riskScore: number): string[] {
    const recommendations: string[] = [];

    if (riskScore > 80) {
      recommendations.push('Enable two-factor authentication');
      recommendations.push('Change your password immediately');
      recommendations.push('Review recent login attempts');
    } else if (riskScore > 60) {
      recommendations.push('Enable biometric authentication');
      recommendations.push('Use a stronger password');
      recommendations.push('Enable login notifications');
    } else if (riskScore > 40) {
      recommendations.push('Enable app lock');
      recommendations.push('Review privacy settings');
    } else {
      recommendations.push('Keep your app updated');
      recommendations.push('Use strong passwords');
    }

    return recommendations;
  }

  // Get recent security events
  async getRecentSecurityEvents(limit: number = 10): Promise<SecurityEvent[]> {
    try {
      await this.loadSecurityEvents();
      return this.events
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Get recent security events failed:', error);
      return [];
    }
  }

  // Clear old security events
  async clearOldSecurityEvents(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      this.events = this.events.filter(
        event => event.timestamp > thirtyDaysAgo
      );
      await this.storeSecurityEvents();
    } catch (error) {
      console.error('Clear old security events failed:', error);
    }
  }

  // Monitor for suspicious patterns
  async monitorSuspiciousPatterns(): Promise<void> {
    try {
      const recentEvents = this.events.filter(
        event => Date.now() - event.timestamp.getTime() < 600000 // Last 10 minutes
      );

      // Check for rapid-fire events
      const eventCount = recentEvents.length;
      if (eventCount > 20) {
        await this.logSecurityEvent(
          'suspicious_activity',
          'high',
          `High frequency of events detected: ${eventCount} events in 10 minutes`
        );
      }

      // Check for repeated failed logins
      const failedLogins = recentEvents.filter(
        event => event.type === 'failed_login'
      );
      if (failedLogins.length > 5) {
        await this.logSecurityEvent(
          'suspicious_activity',
          'critical',
          'Multiple failed login attempts detected'
        );
      }

    } catch (error) {
      console.error('Monitor suspicious patterns failed:', error);
    }
  }

  // Start security monitoring
  startSecurityMonitoring(): void {
    // Monitor every 5 minutes
    setInterval(async () => {
      await this.monitorSuspiciousPatterns();
      await this.updateRiskScore();
    }, 300000);

    // Clear old events daily
    setInterval(async () => {
      await this.clearOldSecurityEvents();
    }, 24 * 60 * 60 * 1000);
  }

  // Get security report
  async getSecurityReport(): Promise<{
    summary: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
    recentEvents: SecurityEvent[];
  }> {
    try {
      const metrics = await this.getSecurityMetrics();
      const recentEvents = await this.getRecentSecurityEvents(5);

      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (metrics.riskScore > 80) {
        riskLevel = 'critical';
      } else if (metrics.riskScore > 60) {
        riskLevel = 'high';
      } else if (metrics.riskScore > 40) {
        riskLevel = 'medium';
      }

      const summary = `Security Status: ${riskLevel.toUpperCase()}. Risk Score: ${metrics.riskScore}%. Total Events: ${metrics.totalEvents}. Critical Events: ${metrics.criticalEvents}.`;

      return {
        summary,
        riskLevel,
        recommendations: metrics.recommendations,
        recentEvents
      };
    } catch (error) {
      console.error('Get security report failed:', error);
      return {
        summary: 'Unable to generate security report',
        riskLevel: 'low',
        recommendations: [],
        recentEvents: []
      };
    }
  }
}

export default new SecurityMonitor();
