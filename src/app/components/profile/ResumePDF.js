import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link, Image, Svg, Path } from '@react-pdf/renderer';

const NAVY = '#1a365d';
const DARK_GRAY = '#2d2d2d';
const MID_GRAY = '#555555';
const LIGHT_GRAY = '#777777';

const styles = StyleSheet.create({
  page: {
    padding: '30 36',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: DARK_GRAY,
    lineHeight: 1.4,
  },
  // ─── HEADER ───
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  profilePic: {
    width: 64,
    height: 64,
    borderRadius: 4,
  },
  headerTextGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 2,
  },
  subtitleDegree: {
    fontSize: 10,
    fontFamily: 'Helvetica-Oblique',
    color: MID_GRAY,
    marginBottom: 1,
  },
  subtitleUniversity: {
    fontSize: 10,
    color: LIGHT_GRAY,
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 5,
    paddingTop: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  contactText: {
    fontSize: 9,
    color: DARK_GRAY,
    textDecoration: 'none',
  },
  // ─── SECTIONS ───
  section: {
    marginTop: 9,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    borderBottomWidth: 1.2,
    borderBottomColor: NAVY,
    paddingBottom: 2,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // ─── ITEMS ───
  itemBlock: {
    marginBottom: 7,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  itemTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: '#111',
  },
  itemSubtitle: {
    fontFamily: 'Helvetica-Oblique',
    fontSize: 9.5,
    color: MID_GRAY,
    marginTop: 1,
  },
  itemDate: {
    fontSize: 9,
    fontFamily: 'Helvetica-Oblique',
    color: LIGHT_GRAY,
    textAlign: 'right',
    flexShrink: 0,
    marginLeft: 8,
  },
  // ─── BODY TEXT ───
  bodyText: {
    fontSize: 9.5,
    textAlign: 'justify',
    color: DARK_GRAY,
    marginTop: 2,
    lineHeight: 1.35,
  },
  // ─── BULLETS ───
  bulletList: {
    marginTop: 3,
    marginLeft: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bulletPoint: {
    width: 10,
    fontSize: 10,
    color: NAVY,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    textAlign: 'justify',
    lineHeight: 1.3,
    color: DARK_GRAY,
  },
  // ─── SKILLS ───
  skillCategory: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  skillLabel: {
    fontFamily: 'Helvetica-Bold',
    width: 120,
    fontSize: 9.5,
    color: DARK_GRAY,
  },
  skillText: {
    flex: 1,
    fontSize: 9.5,
    color: DARK_GRAY,
  },
});

// ─── SVG ICONS ───
const IconPhone = () => (
  <Svg width="9" height="9" viewBox="0 0 24 24">
    <Path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 11.9a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.04 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
      fill={NAVY}
    />
  </Svg>
);
const IconEmail = () => (
  <Svg width="9" height="9" viewBox="0 0 24 24">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill={NAVY} />
    <Path d="M22 6l-10 7L2 6" fill="white" />
  </Svg>
);
const IconGlobe = () => (
  <Svg width="9" height="9" viewBox="0 0 24 24">
    <Path
      d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
      fill="none"
      stroke={NAVY}
      strokeWidth="2"
    />
  </Svg>
);

// ─── BULLET RENDERER ───
const renderBullets = (text) => {
  if (!text) return null;
  const lines = text.split('\n').map(l => l.trim().replace(/^[-•–]\s*/, '')).filter(l => l.length > 0);
  return (
    <View style={styles.bulletList}>
      {lines.map((line, i) => (
        <View key={i} style={styles.bulletItem}>
          <Text style={styles.bulletPoint}>–</Text>
          <Text style={styles.bulletText}>{line}</Text>
        </View>
      ))}
    </View>
  );
};

export default function ResumePDF({ profile }) {
  if (!profile) return null;

  // ── Education header extraction ──
  const mainEdu = profile.education && profile.education.length > 0 ? profile.education[0] : null;
  let degreeLine = '';
  let universityLine = '';
  if (mainEdu) {
    const parts = [mainEdu.degree, mainEdu.course ? `in ${mainEdu.course}` : '', mainEdu.branch ? `(${mainEdu.branch})` : ''].filter(Boolean);
    degreeLine = parts.join(' ');
    universityLine = mainEdu.institution || '';
  } else if (profile.course || profile.branch) {
    degreeLine = [profile.course, profile.branch ? `(${profile.branch})` : ''].filter(Boolean).join(' ');
    universityLine = 'Graphic Era Hill University, Dehradun';
  }

  // ── Group skills by category ──
  const skillsByCategory = (profile.profileSkills || []).reduce((acc, skill) => {
    const cat = skill.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill.name);
    return acc;
  }, {});

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── HEADER ── */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            {profile.profilePicture && (
              <Image src={profile.profilePicture} style={styles.profilePic} />
            )}
            <View style={styles.headerTextGroup}>
              <Text style={styles.name}>{profile.name}</Text>
              {degreeLine ? <Text style={styles.subtitleDegree}>{degreeLine}</Text> : null}
              {universityLine ? <Text style={styles.subtitleUniversity}>{universityLine}</Text> : null}
            </View>
          </View>

          <View style={styles.headerRight}>
            {profile.phone && (
              <View style={styles.contactRow}>
                <IconPhone />
                <Text style={styles.contactText}>{profile.phone}</Text>
              </View>
            )}
            {profile.email && (
              <View style={styles.contactRow}>
                <IconEmail />
                <Text style={styles.contactText}>{profile.email}</Text>
              </View>
            )}
            {profile.linkedin && (
              <View style={styles.contactRow}>
                <IconGlobe />
                <Link src={profile.linkedin} style={styles.contactText}>LinkedIn Profile</Link>
              </View>
            )}
            {profile.github && (
              <View style={styles.contactRow}>
                <IconGlobe />
                <Link src={profile.github} style={styles.contactText}>GitHub</Link>
              </View>
            )}
            {profile.portfolio && (
              <View style={styles.contactRow}>
                <IconGlobe />
                <Link src={profile.portfolio} style={styles.contactText}>Portfolio</Link>
              </View>
            )}
          </View>
        </View>

        {/* ── ABOUT / CAREER OBJECTIVE ── */}
        {profile.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Career Objective</Text>
            <Text style={styles.bodyText}>{profile.description}</Text>
          </View>
        )}

        {/* ── EDUCATION ── */}
        {profile.education && profile.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {profile.education.map((edu, idx) => (
              <View key={idx} style={styles.itemBlock}>
                <View style={styles.rowBetween}>
                  <Text style={styles.itemTitle}>• {edu.institution}</Text>
                  <Text style={styles.itemDate}>{edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ' – Present'}</Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.itemSubtitle}>
                    {[edu.degree, edu.course ? `in ${edu.course}` : '', edu.branch ? `(${edu.branch})` : ''].filter(Boolean).join(' ')}
                  </Text>
                  {edu.grade ? <Text style={styles.itemDate}>CGPA/Percentage: {edu.grade}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── RESEARCH PAPERS ── */}
        {profile.researchPapers && profile.researchPapers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Research Papers</Text>
            {profile.researchPapers.map((paper, idx) => (
              <View key={idx} style={styles.itemBlock}>
                <View style={styles.rowBetween}>
                  <Text style={styles.itemTitle}>• {paper.title}</Text>
                  {(paper.publishedDate || paper.date) && (
                    <Text style={styles.itemDate}>{paper.publishedDate || paper.date}</Text>
                  )}
                </View>
                {paper.journal && (
                  <Text style={styles.itemSubtitle}>Published in: {paper.journal}</Text>
                )}
                {paper.authors && (
                  <Text style={[styles.itemSubtitle, { fontFamily: 'Helvetica' }]}>Authors: {Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors}</Text>
                )}
                {paper.description && (
                  <Text style={styles.bodyText}>{paper.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ── PROJECTS ── */}
        {profile.projects && profile.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {profile.projects.map((proj, idx) => {
              const descLines = proj.description ? proj.description.split('\n').map(l => l.trim()).filter(l => l.length > 0) : [];
              const summaryLine = descLines[0] || null;
              const bulletLines = descLines.slice(1);
              return (
                <View key={idx} style={styles.itemBlock}>
                  <View style={styles.rowBetween}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', flex: 1 }}>
                      <Text style={styles.itemTitle}>• {proj.title}</Text>
                      {proj.link && (
                        <Text style={{ fontSize: 9, marginLeft: 6 }}>
                          | <Link src={proj.link} style={{ color: NAVY, textDecoration: 'none' }}>Link</Link>
                        </Text>
                      )}
                    </View>
                    <Text style={styles.itemDate}>{proj.startDate}{proj.endDate ? ` – ${proj.endDate}` : ' – Present'}</Text>
                  </View>

                  {summaryLine && (
                    <Text style={styles.itemSubtitle}>{summaryLine}</Text>
                  )}

                  {proj.toolsUsed && proj.toolsUsed.length > 0 && (
                    <View style={[styles.bulletItem, { marginTop: 2, marginLeft: 8 }]}>
                      <Text style={styles.bulletPoint}>–</Text>
                      <Text style={styles.bulletText}>
                        <Text style={{ fontFamily: 'Helvetica-Bold' }}>Tools & technologies: </Text>
                        {proj.toolsUsed.join(', ')}
                      </Text>
                    </View>
                  )}

                  {bulletLines.length > 0 && (
                    <View style={styles.bulletList}>
                      {bulletLines.map((line, i) => (
                        <View key={i} style={styles.bulletItem}>
                          <Text style={styles.bulletPoint}>–</Text>
                          <Text style={styles.bulletText}>{line.replace(/^[-•–]\s*/, '')}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ── EXPERIENCE & RESPONSIBILITIES ── */}
        {profile.experience && profile.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience & Positions of Responsibility</Text>
            {profile.experience.map((exp, idx) => (
              <View key={idx} style={styles.itemBlock}>
                <View style={styles.rowBetween}>
                  <Text style={styles.itemTitle}>• {exp.title}</Text>
                  <Text style={styles.itemDate}>{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ' – Present'}</Text>
                </View>
                <Text style={styles.itemSubtitle}>
                  {exp.company}{exp.location ? `, ${exp.location}` : ''}
                </Text>
                {renderBullets(exp.description)}
              </View>
            ))}
          </View>
        )}

        {/* ── TECHNICAL SKILLS & INTERESTS ── */}
        {(Object.keys(skillsByCategory).length > 0 || (profile.languages && profile.languages.length > 0)) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Skills & Interests</Text>
            {Object.entries(skillsByCategory).map(([category, skillsList], idx) => (
              <View key={idx} style={styles.skillCategory}>
                <Text style={styles.skillLabel}>{category}:</Text>
                <Text style={styles.skillText}>{skillsList.join(', ')}</Text>
              </View>
            ))}
            {profile.languages && profile.languages.length > 0 && (
              <View style={styles.skillCategory}>
                <Text style={styles.skillLabel}>Languages:</Text>
                <Text style={styles.skillText}>{profile.languages.join(', ')}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── ACHIEVEMENTS & CERTIFICATIONS ── */}
        {(profile.achievements?.length > 0 || profile.certificates?.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements & Certifications</Text>
            <View style={styles.bulletList}>
              {profile.certificates?.map((cert, idx) => (
                <View key={`cert-${idx}`} style={styles.bulletItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={{ fontFamily: 'Helvetica-Bold' }}>{cert.name}</Text>
                    {cert.issuer ? ` by ${cert.issuer}` : ''}
                    {cert.issueDate ? ` (${cert.issueDate})` : ''}
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
