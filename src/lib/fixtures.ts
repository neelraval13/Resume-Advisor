/**
 * Real analyze result from a smoke-test run against:
 *   resume: Neel Raval, April 2026
 *   jd: Anthropic — Research Manager, Interpretability
 *
 * Used during component development to iterate on visuals without waiting
 * for Claude on every change. Replace with live data via analyzeStream()
 * once components are visually complete.
 */
import type { AnalyzeResponse } from "./types";

export const SAMPLE_ANALYSIS: AnalyzeResponse = {
  fit_assessment: {
    score: 25,
    narrative:
      "Strong technical foundation in AI/ML and solid engineering leadership experience, but this is a senior people management role requiring 2-5+ years of research team management experience that the resume doesn't demonstrate. The candidate shows impressive technical depth and some mentorship, but lacks the substantial people management track record Anthropic seeks.",
  },
  strengths_to_emphasize: [
    {
      strength:
        "AI & Machine Learning expertise with Computer Vision, Agentic Frameworks, Local LLM Deployment, Multimodal AI",
      current_location: "Skills section",
      jd_match:
        "Background in machine learning, AI, or related technical field",
      action:
        "Lead summary with AI/ML technical depth to establish baseline qualifications",
    },
    {
      strength: "CTO role with technical leadership responsibilities",
      current_location: "Work Experience - CTO & Lead Developer",
      jd_match: "Experience leading highly technical teams",
      action:
        "Emphasize team coordination and technical decision-making aspects in role description",
    },
    {
      strength: "Co-authored peer-reviewed research and patent work",
      current_location: "Publications & Patents section",
      jd_match: "Understanding complex technical topics and research",
      action:
        "Move publications higher to demonstrate research capability early",
    },
  ],
  line_edits: [
    {
      section: "Summary",
      current_text:
        "Full-stack software engineer and technical leader with 3+ years of experience architecting AI-powered products across healthcare, enterprise, and consumer domains.",
      suggested_text:
        "AI/ML technical leader with 3+ years of experience architecting production AI systems across healthcare, enterprise, and consumer domains, including deep learning model deployment and multimodal AI applications.",
      rationale:
        "Emphasizes AI/ML focus over full-stack development to match JD requirements",
      priority: "high",
    },
    {
      section: "Work Experience > CTO & Lead Developer",
      current_text:
        "Spearheading development of an AI-powered diagnostic pipeline for a proprietary cervical cancer screening device; architecting computer vision and machine learning models to analyze live video feeds from a camera-equipped speculum and deliver real-time tissue analysis and clinical parameters to assist gynecologists.",
      suggested_text:
        "Leading cross-functional technical team in developing AI-powered diagnostic pipeline; architecting computer vision and machine learning models for real-time medical analysis, coordinating research direction and technical execution across engineering and clinical stakeholders.",
      rationale:
        "Highlights team leadership and coordination aspects relevant to management role",
      priority: "high",
    },
    {
      section: "Skills > Leadership & Product Strategy",
      current_text:
        "Technical Roadmapping • Engineering Leadership • Product Strategy • System Architecture • SEO • Answer Engine Optimization (AEO) • Agile • Scrum • Code Review • Mentorship",
      suggested_text:
        "Research Direction & Planning • Cross-functional Team Coordination • Technical Mentorship • Engineering Leadership • Performance Evaluation • Technical Roadmapping • System Architecture",
      rationale:
        "Reframes skills toward research management and people development",
      priority: "medium",
    },
  ],
  structural_suggestions: [
    {
      change:
        "Move Publications & Patents section above Projects to emphasize research background early",
      rationale:
        "Research experience is more relevant than personal projects for this role",
    },
    {
      change:
        "Create subsection under Activities highlighting mentorship and team leadership experiences",
      rationale: "People management experience is critical requirement",
    },
  ],
  skill_gap_recommendations: [
    {
      gap: "2-5+ years people management experience managing technical research teams",
      action:
        "Seek opportunities to formally manage direct reports in current role, or take on team lead responsibilities for specific research initiatives",
      type: "other",
      effort_estimate: "6-18 months of building track record",
      urgency: "critical",
      concrete_starter:
        "This week: Discuss with current leadership about taking on formal management responsibilities for junior developers or research team members",
    },
    {
      gap: "Deep familiarity with mechanistic interpretability research and Anthropic's specific approach",
      action:
        "Study Anthropic's key papers starting with Toy Models of Superposition, Scaling Monosemanticity, and Transformer Circuits papers",
      type: "reading",
      effort_estimate: "2-3 months of focused study",
      urgency: "critical",
      concrete_starter:
        "This week: Read and take detailed notes on Chris Olah's introduction to Interpretability and one foundational Anthropic interpretability paper",
    },
    {
      gap: "Research management experience with open-ended, exploratory research agendas",
      action:
        "Lead a research initiative within current company focused on understanding model behavior or interpretability aspects of current AI systems",
      type: "project",
      effort_estimate: "3-6 months",
      urgency: "helpful",
      concrete_starter:
        "This week: Propose an interpretability research project for current medical AI pipeline - analyzing what features the computer vision model learns",
    },
    {
      gap: "Experience with performance evaluation, career development, and formal hiring processes",
      action:
        "Take management training courses and get involved in hiring processes at current company",
      type: "course",
      effort_estimate: "3-6 months of training plus practice",
      urgency: "helpful",
      concrete_starter:
        "This week: Enroll in a technical leadership or people management course and volunteer to participate in next hiring round",
    },
  ],
  red_flags: [
    "JD requires minimum 2-5 years management experience; current role appears more individual contributor focused despite CTO title",
    "JD expects deep familiarity with mechanistic interpretability research; resume shows applied AI but no interpretability background",
    "Role is for research management of foundational AI safety work; background shows product-focused AI development",
  ],
  full_rewrite_if_requested: null,
};
