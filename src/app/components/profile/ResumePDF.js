import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff'
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    paddingBottom: 10
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'Helvetica-Bold'
  },
  contact: {
    fontSize: 10,
    color: '#333333',
    marginBottom: 2
  },
  headline: {
    fontSize: 12,
    color: '#555555',
    fontStyle: 'italic',
    marginTop: 5
  },
  section: {
    marginTop: 15,
    marginBottom: 5
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 3,
    fontFamily: 'Helvetica-Bold'
  },
  itemGroup: {
    marginBottom: 10
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold'
  },
  itemSubtitle: {
    fontSize: 10,
    fontStyle: 'italic'
  },
  itemDate: {
    fontSize: 10,
    color: '#666666'
  },
  itemDescription: {
    fontSize: 10,
    lineHeight: 1.4,
    marginTop: 2
  },
  skillTags: {
    fontSize: 10,
    lineHeight: 1.5
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.5
  }
});

const ResumePDF = ({ profile }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        <View style={styles.header}>
          <Text style={styles.name}>{profile?.user?.name || "User Name"}</Text>
          <Text style={styles.contact}>
            {profile?.user?.email || "email@example.com"} 
            {profile?.location ? `  |  ${profile.location}` : ""}
            {profile?.website ? `  |  ${profile.website}` : ""}
          </Text>
          {profile?.headline && (
            <Text style={styles.headline}>{profile.headline}</Text>
          )}
        </View>

        {profile?.about && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summaryText}>{profile.about}</Text>
          </View>
        )}

        {profile?.education && profile.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {profile.education.map((edu, index) => (
              <View key={index} style={styles.itemGroup}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{edu.school}</Text>
                  <Text style={styles.itemDate}>
                    {edu.startDate ? new Date(edu.startDate).getFullYear() : ""} - {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}
                  </Text>
                </View>
                <Text style={styles.itemSubtitle}>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</Text>
                {edu.description && <Text style={styles.itemDescription}>{edu.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {profile?.experience && profile.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {profile.experience.map((exp, index) => (
              <View key={index} style={styles.itemGroup}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{exp.title}</Text>
                  <Text style={styles.itemDate}>
                    {exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ""} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Present"}
                  </Text>
                </View>
                <Text style={styles.itemSubtitle}>{exp.company} {exp.location ? `- ${exp.location}` : ""}</Text>
                {exp.description && <Text style={styles.itemDescription}>{exp.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {profile?.projects && profile.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {profile.projects.map((proj, index) => (
              <View key={index} style={styles.itemGroup}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{proj.title}</Text>
                  {proj.link && <Text style={styles.itemDate}>{proj.link}</Text>}
                </View>
                {proj.technologies && proj.technologies.length > 0 && (
                  <Text style={styles.itemSubtitle}>Technologies: {proj.technologies.join(", ")}</Text>
                )}
                {proj.description && <Text style={styles.itemDescription}>{proj.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {profile?.skills && profile.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skillTags}>{profile.skills.join(" • ")}</Text>
          </View>
        )}

      </Page>
    </Document>
  );
};

export default ResumePDF;
