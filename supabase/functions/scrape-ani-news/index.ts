
// Function to store detected alerts in Supabase
async function storeAlerts(alerts: EmergencyAlert[]) {
  if (alerts.length === 0) {
    return;
  }
  
  try {
    console.log(`Attempting to store ${alerts.length} alerts from ANI`);
    
    for (const alert of alerts) {
      console.log(`Processing alert: ${alert.title}`);
      
      const { data, error } = await supabase
        .from('emergency_alerts')
        .upsert(
          { 
            title: alert.title, 
            url: alert.url, 
            matched_keywords: alert.matched_keywords,
            source: 'ANI News' 
          },
          { 
            onConflict: 'title',
            ignoreDuplicates: false
          }
        );
      
      if (error) {
        console.error(`Error storing alert "${alert.title}":`, error);
      } else {
        console.log(`Successfully stored/updated alert: ${alert.title}`);
      }
    }
  } catch (error) {
    console.error("Exception during alert storage:", error);
  }
}
