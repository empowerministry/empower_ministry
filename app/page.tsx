import Header from './components/Header'
import HeroSection from './components/HeroSection'
import WhoWeAre from './components/WhoWeAre'
import ProjectsSection from './components/ProjectsSection'
import LeadershipTeam from './components/LeadershipTeam'
import JourneyTimeline from './components/JourneyTimeline'
import Footer from './components/Footer'

export default function Home() {
  return (
    <main>
      <Header/>
      <HeroSection />
      <WhoWeAre />
      <ProjectsSection />
      <JourneyTimeline />
      <LeadershipTeam />
      <Footer />
    </main>
  )
}
