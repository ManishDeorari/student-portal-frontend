import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333',
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 10,
    textAlign: 'center',
  },
  name: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: '#000',
  },
  contactInfo: {
    fontSize: 9,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  contactItem: {
    marginRight: 8,
  },
  link: {
    color: '#0056b3',
    textDecoration: 'none',
  },
  section: {
    marginTop: 10,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 2,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  itemBlock: {
    marginBottom: 6,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  itemTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: '#000',
  },
  itemSubtitle: {
    fontFamily: 'Helvetica-Oblique',
    fontSize: 10,
  },
  itemDate: {
    fontSize: 9,
    textAlign: 'right',
  },
  bulletList: {
    marginTop: 3,
    marginLeft: 10,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bulletPoint: {
    width: 10,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.3,
  },
  skillCategory: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  skillLabel: {
    fontFamily: 'Helvetica-Bold',
    width: 100,
    fontSize: 10,
  },
  skillText: {
    flex: 1,
    fontSize: 10,
  },
  textDescription: {
    fontSize: 9,
    marginTop: 2,
    lineHeight: 1.3,
  }
});

export default function ResumePDF({ profile }) {
  if (!profile) return null;

  // Group skills by category
  const skillsByCategory = (profile.profileSkills || []).reduce((acc, skill) => {
    const cat = skill.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill.name);
    return acc;
  }, {});

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{profile.name}</Text>
          <View style={styles.contactInfo}>
            {profile.phone && <Text style={styles.contactItem}>{profile.phone}</Text>}
            {profile.email && <Text style={styles.contactItem}>| {profile.email}</Text>}
            {profile.linkedin && (
              <Text style={styles.contactItem}>
                | <Link src={profile.linkedin} style={styles.link}>LinkedIn</Link>
              </Text>
            )}
            {profile.portfolio && (
              <Text style={styles.contactItem}>
                | <Link src={profile.portfolio} style={styles.link}>Portfolio</Link>
              </Text>
            )}
            {profile.github && (
              <Text style={styles.contactItem}>
                | <Link src={profile.github} style={styles.link}>GitHub</Link>
              </Text>
            )}
          </View>
        </View>

        {/* Education */}
        {profile.education && profile.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {profile.education.map((edu, idx) => (
              <View key={idx} style={styles.itemBlock}>
                <View style={styles.rowBetween}>
                  <Text style={styles.itemTitle}>{edu.institution}</Text>
                  <Text style={styles.itemDate}>{edu.startDate} – {edu.endDate || 'Present'}</Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.itemSubtitle}>{edu.degree} in {edu.fieldOfStudy}</Text>
                  {edu.grade && <Text style={styles.itemDate}>CGPA/Grade: {edu.grade}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {Object.keys(skillsByCategory).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Skills & Interests</Text>
            {Object.entries(skillsByCategory).map(([category, skillsList], idx) => (
              <View key={idx} style={styles.skillCategory}>
                <Text style={styles.skillLabel}>{category}:</Text>
                <Text style={styles.skillText}>{skillsList.join(", ")}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Experience */}
        {profile.experience && profile.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {profile.experience.map((exp, idx) => (
              <View key={idx} style={styles.itemBlock}>
                <View style={styles.rowBetween}>
                  <Text style={styles.itemTitle}>{exp.title}</Text>
                  <Text style={styles.itemDate}>{exp.startDate} – {exp.endDate}</Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.itemSubtitle}>{exp.company} {exp.location ? `- ${exp.location}` : ''}</Text>
                </View>
                {exp.description && (
                  <View style={styles.bulletList}>
                    {exp.description.split('\n').filter(l => l.trim()).map((line, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={styles.bulletPoint}>•</Text>
                        <Text style={styles.bulletText}>{line.replace(/^[-•]\s*/, '')}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {profile.projects && profile.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {profile.projects.map((proj, idx) => (
              <View key={idx} style={styles.itemBlock}>
                <View style={styles.rowBetween}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={styles.itemTitle}>{proj.title}</Text>
                    {proj.link && (
                      <Text style={{ fontSize: 9, marginLeft: 5 }}>
                        | <Link src={proj.link} style={styles.link}>Link</Link>
                      </Text>
                    )}
                  </View>
                  <Text style={styles.itemDate}>{proj.startDate} – {proj.endDate || 'Present'}</Text>
                </View>
                {proj.toolsUsed && proj.toolsUsed.length > 0 && (
                  <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Oblique', marginTop: 1 }}>
                    Tools: {proj.toolsUsed.join(", ")}
                  </Text>
                )}
                {proj.description && (
                  <Text style={styles.textDescription}>{proj.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Achievements & Certifications */}
        {(profile.achievements?.length > 0 || profile.certificates?.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements & Certifications</Text>
            <View style={styles.bulletList}>
              {profile.certificates?.map((cert, idx) => (
                <View key={`cert-${idx}`} style={styles.bulletItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={{ fontFamily: 'Helvetica-Bold' }}>{cert.name}</Text> by {cert.issuer} ({cert.issueDate})
                  </Text>
                </View>
              ))}
              {profile.achievements?.map((ach, idx) => (
                <View key={`ach-${idx}`} style={styles.bulletItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={{ fontFamily: 'Helvetica-Bold' }}>{ach.title}</Text>
                    {ach.date ? ` (${ach.date})` : ''} 
                    {ach.description ? `: ${ach.description}` : ''}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

      </Page>
    </Document>
  );
}
