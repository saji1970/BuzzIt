/**
 * AI Recommendation Engine
 * Analyzes user behavior, preferences, location, and connections
 * to provide personalized buzz filtering and user recommendations
 */

class RecommendationEngine {
  constructor() {
    // User preference weights (learned over time)
    this.preferenceWeights = {
      interests: 0.4,
      location: 0.2,
      socialConnections: 0.2,
      engagementHistory: 0.2,
    };
  }

  /**
   * Analyze user preferences from their activity
   */
  analyzeUserPreferences(user, buzzes, interactions = []) {
    const preferences = {
      interests: this.extractInterestPreferences(user, buzzes, interactions),
      location: this.extractLocationPreferences(user, buzzes),
      contentTypes: this.extractContentTypePreferences(user, buzzes, interactions),
      engagementPatterns: this.analyzeEngagementPatterns(interactions),
      timePreferences: this.analyzeTimePreferences(interactions),
    };

    return preferences;
  }

  /**
   * Extract interest preferences from user activity
   */
  extractInterestPreferences(user, buzzes, interactions) {
    const interestScores = {};
    
    // Base interests from user profile
    if (user.interests && Array.isArray(user.interests)) {
      user.interests.forEach(interest => {
        const interestId = typeof interest === 'object' ? interest.id : interest;
        interestScores[interestId] = 1.0;
      });
    }

    // Boost interests based on engagement
    interactions.forEach(interaction => {
      if (interaction.buzz && interaction.buzz.interests) {
        interaction.buzz.interests.forEach(interest => {
          const interestId = typeof interest === 'object' ? interest.id : interest;
          const boost = interaction.type === 'like' ? 0.3 : 
                       interaction.type === 'comment' ? 0.5 :
                       interaction.type === 'share' ? 0.7 : 0.1;
          
          if (!interestScores[interestId]) {
            interestScores[interestId] = 0;
          }
          interestScores[interestId] += boost;
        });
      }
    });

    // Normalize scores
    const maxScore = Math.max(...Object.values(interestScores), 1);
    Object.keys(interestScores).forEach(key => {
      interestScores[key] = Math.min(interestScores[key] / maxScore, 1.0);
    });

    return interestScores;
  }

  /**
   * Extract location preferences
   */
  extractLocationPreferences(user, buzzes) {
    const locationCounts = {};
    
    buzzes.forEach(buzz => {
      if (buzz.location && buzz.location.city) {
        const city = buzz.location.city;
        locationCounts[city] = (locationCounts[city] || 0) + 1;
      }
    });

    // Find most engaged locations
    const topLocations = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city]) => city);

    return {
      preferredCities: topLocations,
      currentCity: user.location?.city || null,
    };
  }

  /**
   * Extract content type preferences
   */
  extractContentTypePreferences(user, buzzes, interactions) {
    const typeScores = {
      text: 0,
      image: 0,
      video: 0,
      audio: 0,
    };

    interactions.forEach(interaction => {
      if (interaction.buzz && interaction.buzz.type) {
        const type = interaction.buzz.type;
        if (typeScores.hasOwnProperty(type)) {
          typeScores[type] += interaction.type === 'like' ? 1 : 
                              interaction.type === 'comment' ? 2 : 3;
        }
      }
    });

    // Normalize
    const total = Object.values(typeScores).reduce((a, b) => a + b, 0);
    if (total > 0) {
      Object.keys(typeScores).forEach(key => {
        typeScores[key] = typeScores[key] / total;
      });
    }

    return typeScores;
  }

  /**
   * Analyze engagement patterns
   */
  analyzeEngagementPatterns(interactions) {
    const patterns = {
      likesPerDay: 0,
      commentsPerDay: 0,
      sharesPerDay: 0,
      activeHours: [],
    };

    if (interactions.length === 0) return patterns;

    const daysActive = new Set();
    const hourCounts = {};

    interactions.forEach(interaction => {
      const date = new Date(interaction.timestamp || Date.now());
      daysActive.add(date.toDateString());
      
      const hour = date.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;

      if (interaction.type === 'like') patterns.likesPerDay += 1;
      if (interaction.type === 'comment') patterns.commentsPerDay += 1;
      if (interaction.type === 'share') patterns.sharesPerDay += 1;
    });

    const totalDays = Math.max(daysActive.size, 1);
    patterns.likesPerDay = patterns.likesPerDay / totalDays;
    patterns.commentsPerDay = patterns.commentsPerDay / totalDays;
    patterns.sharesPerDay = patterns.sharesPerDay / totalDays;

    // Find most active hours
    patterns.activeHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    return patterns;
  }

  /**
   * Analyze time preferences
   */
  analyzeTimePreferences(interactions) {
    const timePreferences = {
      peakHours: [],
      preferredDays: [],
    };

    if (interactions.length === 0) return timePreferences;

    const hourCounts = {};
    const dayCounts = {};

    interactions.forEach(interaction => {
      const date = new Date(interaction.timestamp || Date.now());
      const hour = date.getHours();
      const day = date.getDay();

      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    timePreferences.peakHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    timePreferences.preferredDays = Object.entries(dayCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => parseInt(day));

    return timePreferences;
  }

  /**
   * Score buzz relevance for a user
   */
  scoreBuzzRelevance(buzz, userPreferences, userLocation = null) {
    let score = 0;

    // Interest matching (40% weight)
    if (buzz.interests && buzz.interests.length > 0) {
      const interestMatch = buzz.interests.reduce((match, interest) => {
        const interestId = typeof interest === 'object' ? interest.id : interest;
        return match + (userPreferences.interests[interestId] || 0);
      }, 0) / Math.max(buzz.interests.length, 1);

      score += interestMatch * this.preferenceWeights.interests;
    }

    // Location matching (20% weight)
    if (userLocation && buzz.location) {
      const locationMatch = this.calculateLocationSimilarity(
        userLocation,
        buzz.location
      );
      score += locationMatch * this.preferenceWeights.location;
    }

    // Content type preference (20% weight)
    if (buzz.type && userPreferences.contentTypes[buzz.type]) {
      score += userPreferences.contentTypes[buzz.type] * 0.2;
    }

    // Engagement history boost (20% weight)
    // Boost if user has previously engaged with similar content
    const engagementBoost = this.calculateEngagementBoost(
      buzz,
      userPreferences.engagementPatterns
    );
    score += engagementBoost * this.preferenceWeights.engagementHistory;

    return Math.min(score, 1.0);
  }

  /**
   * Calculate location similarity
   */
  calculateLocationSimilarity(userLocation, buzzLocation) {
    // Same city = 1.0, same country = 0.5, different = 0.1
    if (userLocation.city && buzzLocation.city) {
      if (userLocation.city === buzzLocation.city) return 1.0;
      if (userLocation.country === buzzLocation.country) return 0.5;
    }
    return 0.1;
  }

  /**
   * Calculate engagement boost
   */
  calculateEngagementBoost(buzz, engagementPatterns) {
    // Boost if buzz type matches user's engagement patterns
    if (buzz.type === 'video' && engagementPatterns.sharesPerDay > 0.5) {
      return 0.3;
    }
    if (buzz.type === 'image' && engagementPatterns.likesPerDay > 1) {
      return 0.2;
    }
    return 0.1;
  }

  /**
   * Recommend users to follow
   */
  recommendUsers(targetUser, allUsers, contacts = [], socialConnections = []) {
    const recommendations = [];

    allUsers.forEach(user => {
      // Skip self
      if (user.id === targetUser.id) return;

      // Skip already subscribed
      if (targetUser.subscribedChannels?.includes(user.id)) return;

      let score = 0;
      const reasons = [];

      // Social connection boost (30% weight)
      const isContact = contacts.some(c => 
        c.email === user.email || 
        c.phone === user.mobileNumber ||
        c.name?.toLowerCase().includes(user.displayName?.toLowerCase())
      );
      
      const isSocialConnection = socialConnections.some(s => 
        s.userId === user.id || 
        s.username === user.username
      );

      if (isContact) {
        score += 0.3;
        reasons.push('In your contacts');
      }
      if (isSocialConnection) {
        score += 0.3;
        reasons.push('Social connection');
      }

      // Interest overlap (25% weight)
      const interestOverlap = this.calculateInterestOverlap(
        targetUser.interests || [],
        user.interests || []
      );
      score += interestOverlap * 0.25;
      if (interestOverlap > 0.5) {
        reasons.push('Similar interests');
      }

      // Location proximity (20% weight)
      if (targetUser.location && user.location) {
        const locationMatch = this.calculateLocationSimilarity(
          targetUser.location,
          user.location
        );
        score += locationMatch * 0.2;
        if (locationMatch > 0.5) {
          reasons.push('Nearby location');
        }
      }

      // Engagement score (15% weight)
      const engagementScore = this.calculateUserEngagementScore(user);
      score += engagementScore * 0.15;
      if (engagementScore > 0.7) {
        reasons.push('Active user');
      }

      // Verification boost (10% weight)
      if (user.isVerified) {
        score += 0.1;
        reasons.push('Verified account');
      }

      if (score > 0.3) { // Only recommend if score > 30%
        recommendations.push({
          user,
          score: Math.min(score, 1.0),
          reasons: reasons.slice(0, 3), // Top 3 reasons
        });
      }
    });

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Top 20 recommendations
  }

  /**
   * Calculate interest overlap between two users
   */
  calculateInterestOverlap(user1Interests, user2Interests) {
    if (!user1Interests || !user2Interests || 
        user1Interests.length === 0 || user2Interests.length === 0) {
      return 0;
    }

    const user1Ids = new Set(
      user1Interests.map(i => typeof i === 'object' ? i.id : i)
    );
    const user2Ids = new Set(
      user2Interests.map(i => typeof i === 'object' ? i.id : i)
    );

    const intersection = new Set(
      [...user1Ids].filter(id => user2Ids.has(id))
    );
    const union = new Set([...user1Ids, ...user2Ids]);

    // Jaccard similarity
    return intersection.size / union.size;
  }

  /**
   * Calculate user engagement score
   */
  calculateUserEngagementScore(user) {
    // Factors: buzz count, followers, verification
    let score = 0;

    // Buzz count (normalized, max 100 buzzes = 1.0)
    const buzzScore = Math.min((user.buzzCount || 0) / 100, 1.0);
    score += buzzScore * 0.4;

    // Followers (normalized, max 1000 followers = 1.0)
    const followerScore = Math.min((user.followers || 0) / 1000, 1.0);
    score += followerScore * 0.3;

    // Verified status
    if (user.isVerified) score += 0.2;

    // Account age (older = more trusted, max 365 days = 1.0)
    if (user.createdAt) {
      const daysSinceCreation = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const ageScore = Math.min(daysSinceCreation / 365, 1.0);
      score += ageScore * 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Filter and rank buzzes based on user preferences
   */
  filterAndRankBuzzes(buzzes, userPreferences, userLocation = null) {
    const scoredBuzzes = buzzes.map(buzz => ({
      buzz,
      relevanceScore: this.scoreBuzzRelevance(buzz, userPreferences, userLocation),
    }));

    // Sort by relevance score (highest first)
    scoredBuzzes.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return scoredBuzzes.map(item => item.buzz);
  }

  /**
   * Get smart feed (top relevant buzzes)
   */
  getSmartFeed(buzzes, userPreferences, userLocation = null, limit = 50) {
    const filtered = this.filterAndRankBuzzes(buzzes, userPreferences, userLocation);
    return filtered.slice(0, limit);
  }
}

module.exports = new RecommendationEngine();

