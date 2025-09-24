// Widget Data Management - Persistence and Recovery
export class WidgetDataManager {
  static STORAGE_PREFIX = 'widget_data_';
  static MAX_STORAGE_TIME = 24 * 60 * 60 * 1000; // 24 hours

  // Save widget data to localStorage
  static saveWidgetData(widgetId, widgetType, data) {
    try {
      const storageData = {
        data: data,
        type: widgetType,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      const key = `${this.STORAGE_PREFIX}${widgetId}`;
      localStorage.setItem(key, JSON.stringify(storageData));
      
      console.log(`Widget data saved: ${widgetType} (${widgetId})`);
      return true;
    } catch (error) {
      console.error('Failed to save widget data:', error);
      return false;
    }
  }

  // Load widget data from localStorage
  static loadWidgetData(widgetId) {
    try {
      const key = `${this.STORAGE_PREFIX}${widgetId}`;
      const stored = localStorage.getItem(key);
      
      if (!stored) return null;
      
      const storageData = JSON.parse(stored);
      
      // Check if data is expired
      if (Date.now() - storageData.timestamp > this.MAX_STORAGE_TIME) {
        this.clearWidgetData(widgetId);
        return null;
      }
      
      console.log(`Widget data loaded: ${storageData.type} (${widgetId})`);
      return storageData.data;
    } catch (error) {
      console.error('Failed to load widget data:', error);
      return null;
    }
  }

  // Clear specific widget data
  static clearWidgetData(widgetId) {
    try {
      const key = `${this.STORAGE_PREFIX}${widgetId}`;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to clear widget data:', error);
      return false;
    }
  }

  // Clear all expired widget data
  static clearExpiredData() {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.STORAGE_PREFIX)
      );
      
      let clearedCount = 0;
      keys.forEach(key => {
        try {
          const stored = JSON.parse(localStorage.getItem(key));
          if (Date.now() - stored.timestamp > this.MAX_STORAGE_TIME) {
            localStorage.removeItem(key);
            clearedCount++;
          }
        } catch (e) {
          // Invalid data, remove it
          localStorage.removeItem(key);
          clearedCount++;
        }
      });
      
      if (clearedCount > 0) {
        console.log(`Cleared ${clearedCount} expired widget data entries`);
      }
      
      return clearedCount;
    } catch (error) {
      console.error('Failed to clear expired data:', error);
      return 0;
    }
  }

  // Get storage usage info
  static getStorageInfo() {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.STORAGE_PREFIX)
      );
      
      let totalSize = 0;
      const widgets = [];
      
      keys.forEach(key => {
        const data = localStorage.getItem(key);
        totalSize += data.length;
        
        try {
          const parsed = JSON.parse(data);
          widgets.push({
            id: key.replace(this.STORAGE_PREFIX, ''),
            type: parsed.type,
            size: data.length,
            timestamp: parsed.timestamp,
            age: Date.now() - parsed.timestamp
          });
        } catch (e) {
          // Skip invalid entries
        }
      });
      
      return {
        totalWidgets: widgets.length,
        totalSize: totalSize,
        widgets: widgets.sort((a, b) => b.timestamp - a.timestamp)
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { totalWidgets: 0, totalSize: 0, widgets: [] };
    }
  }
}

// Export utility for analysis results
export class AnalysisExporter {
  // Export to CSV format
  static exportToCSV(data, filename) {
    try {
      let csvContent = '';
      
      if (data.content_gaps) {
        // Content Gap Analysis CSV
        csvContent = 'Topic,Priority,Gap Score,Search Volume,Traffic Estimate,Keywords\n';
        
        ['high_priority', 'medium_priority', 'low_priority'].forEach(priority => {
          const gaps = data.content_gaps[priority] || [];
          gaps.forEach(gap => {
            const row = [
              gap.topic || '',
              gap.priority_level || priority.replace('_', ' '),
              gap.gap_score || '',
              gap.search_volume_estimate || '',
              gap.estimated_monthly_traffic || '',
              gap.keywords ? gap.keywords.join('; ') : ''
            ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
            
            csvContent += row + '\n';
          });
        });
      } else if (data.keyword_rankings) {
        // SEO Ranking CSV
        csvContent = 'Keyword,Current Rank,Page,Featured Snippet,URL,Title\n';
        
        data.keyword_rankings.forEach(ranking => {
          const row = [
            ranking.keyword || '',
            ranking.current_rank || '',
            ranking.page || '',
            ranking.featured_snippet ? 'Yes' : 'No',
            ranking.url || '',
            ranking.title || ''
          ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
          
          csvContent += row + '\n';
        });
      } else if (data.issues) {
        // SEO Audit CSV
        csvContent = 'Issue Type,Status,Description,Priority,Page\n';
        
        Object.entries(data.issues || {}).forEach(([issueType, details]) => {
          const row = [
            issueType,
            details.status || '',
            details.description || '',
            details.priority || '',
            details.page || ''
          ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
          
          csvContent += row + '\n';
        });
      }
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename || 'analysis'}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Failed to export CSV:', error);
      return false;
    }
  }

  // Export to JSON format
  static exportToJSON(data, filename) {
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename || 'analysis'}_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Failed to export JSON:', error);
      return false;
    }
  }

  // Generate shareable summary
  static generateSummary(data, type) {
    try {
      let summary = `${type} Analysis Summary\n`;
      summary += `Generated: ${new Date().toLocaleString()}\n`;
      summary += `${'='.repeat(50)}\n\n`;
      
      if (data.content_gaps) {
        // Content Gap Analysis Summary
        summary += `CONTENT GAP ANALYSIS\n`;
        summary += `Client Domain: ${data.analysis_metadata?.client_domain || 'Unknown'}\n`;
        summary += `Analysis Confidence: ${data.analysis_metadata?.analysis_confidence || 0}%\n\n`;
        
        summary += `KEY FINDINGS:\n`;
        summary += `• Critical Gaps: ${data.kpi_metrics?.critical_gaps || 0}\n`;
        summary += `• Total Opportunities: ${data.kpi_metrics?.total_opportunities || 0}\n`;
        summary += `• Traffic Potential: ${data.strategic_insights?.market_opportunities?.total_traffic_potential || 'TBD'}\n\n`;
        
        if (data.content_gaps.high_priority?.length > 0) {
          summary += `HIGH PRIORITY OPPORTUNITIES:\n`;
          data.content_gaps.high_priority.slice(0, 5).forEach((gap, i) => {
            summary += `${i + 1}. ${gap.topic} (Score: ${gap.gap_score})\n`;
            summary += `   Traffic: ${gap.estimated_monthly_traffic}\n`;
          });
        }
      } else if (data.keyword_rankings) {
        // SEO Ranking Summary
        summary += `SEO RANKING ANALYSIS\n`;
        summary += `Total Keywords: ${data.summary?.total_keywords || 0}\n`;
        summary += `Average Position: ${data.summary?.average_position || 0}\n`;
        summary += `Top 10 Rankings: ${data.summary?.top_10_rankings || 0}\n\n`;
        
        if (data.keyword_rankings.length > 0) {
          summary += `TOP PERFORMING KEYWORDS:\n`;
          data.keyword_rankings
            .filter(k => k.current_rank <= 10)
            .slice(0, 5)
            .forEach((keyword, i) => {
              summary += `${i + 1}. ${keyword.keyword} - Position ${keyword.current_rank}\n`;
            });
        }
      } else if (data.seoScore) {
        // SEO Audit Summary
        summary += `SEO AUDIT ANALYSIS\n`;
        summary += `Overall Score: ${data.seoScore}/100\n`;
        summary += `Mobile Score: ${data.mobileScore}/100\n`;
        summary += `Desktop Score: ${data.desktopScore}/100\n`;
        summary += `Load Time: ${data.avgLoadTime}s\n\n`;
        
        summary += `PERFORMANCE METRICS:\n`;
        Object.entries(data.performanceMetrics || {}).forEach(([metric, score]) => {
          summary += `• ${metric}: ${score}/100\n`;
        });
      }
      
      return summary;
    } catch (error) {
      console.error('Failed to generate summary:', error);
      return 'Failed to generate summary';
    }
  }

  // Export SEO Meta Tags as HTML
  static exportMetaTags(data) {
    try {
      const metaTags = data?.improved_recommended_meta_tags || {};
      let htmlContent = `<!DOCTYPE html>
<html>
<head>
  <!-- SEO Meta Tags Generated on ${new Date().toLocaleString()} -->
  <!-- Website: ${data?.website_url || 'Not specified'} -->
  
  <!-- Basic Meta Tags -->`;

      if (metaTags.meta_title?.optimized) {
        htmlContent += `\n  <title>${metaTags.meta_title.optimized}</title>`;
      }
      
      if (metaTags.meta_description?.optimized) {
        htmlContent += `\n  <meta name="description" content="${metaTags.meta_description.optimized}">`;
      }
      
      if (metaTags.meta_keywords?.optimized) {
        htmlContent += `\n  <meta name="keywords" content="${metaTags.meta_keywords.optimized}">`;
      }
      
      if (metaTags.canonical_url?.optimized) {
        htmlContent += `\n  <link rel="canonical" href="${metaTags.canonical_url.optimized}">`;
      }
      
      if (metaTags.robots?.optimized) {
        htmlContent += `\n  <meta name="robots" content="${metaTags.robots.optimized}">`;
      }
      
      htmlContent += `\n\n  <!-- Open Graph Tags -->`;
      const og = metaTags.open_graph || {};
      if (og.og_title?.optimized) htmlContent += `\n  <meta property="og:title" content="${og.og_title.optimized}">`;
      if (og.og_description?.optimized) htmlContent += `\n  <meta property="og:description" content="${og.og_description.optimized}">`;
      if (og.og_image?.optimized) htmlContent += `\n  <meta property="og:image" content="${og.og_image.optimized}">`;
      if (og.og_url?.optimized) htmlContent += `\n  <meta property="og:url" content="${og.og_url.optimized}">`;
      if (og.og_type?.optimized) htmlContent += `\n  <meta property="og:type" content="${og.og_type.optimized}">`;
      
      htmlContent += `\n\n  <!-- Twitter Card Tags -->`;
      const twitter = metaTags.twitter_card || {};
      if (twitter.twitter_card?.optimized) htmlContent += `\n  <meta name="twitter:card" content="${twitter.twitter_card.optimized}">`;
      if (twitter.twitter_title?.optimized) htmlContent += `\n  <meta name="twitter:title" content="${twitter.twitter_title.optimized}">`;
      if (twitter.twitter_description?.optimized) htmlContent += `\n  <meta name="twitter:description" content="${twitter.twitter_description.optimized}">`;
      if (twitter.twitter_image?.optimized) htmlContent += `\n  <meta name="twitter:image" content="${twitter.twitter_image.optimized}">`;
      
      htmlContent += `\n</head>
<body>
  <!-- Your website content goes here -->
</body>
</html>`;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `meta-tags_${data?.site_name || 'website'}_${new Date().toISOString().split('T')[0]}.html`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Failed to export meta tags:', error);
      return false;
    }
  }
}

// Initialize cleanup on app start
if (typeof window !== 'undefined') {
  // Clean expired data on page load
  setTimeout(() => {
    WidgetDataManager.clearExpiredData();
  }, 1000);
}