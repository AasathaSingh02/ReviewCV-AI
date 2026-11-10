import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scan, Github, Linkedin, Mail, ShieldCheck, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export const Footer: React.FC = () => {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const handleScrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="col-span-1 md:col-span-2"
          >
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Scan className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">ReviewCV AI</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              Revolutionizing resume optimization with AI-powered analysis. 
              Built for the modern recruitment landscape.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <button
                  onClick={handleScrollToFeatures}
                  className="hover:text-blue-400 transition-colors text-left"
                >
                  About
                </button>
              </li>
              <li>
                <a
                  href="mailto:aasathasingh02@gmail.com?subject=ReviewCV%20AI%20Inquiry"
                  className="hover:text-blue-400 transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <button
                  onClick={() => setPrivacyOpen(true)}
                  className="hover:text-blue-400 transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setTermsOpen(true)}
                  className="hover:text-blue-400 transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <motion.a
                href="https://www.linkedin.com/in/aasatha-singh"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-2 bg-gray-800 rounded-lg hover:bg-blue-600 transition-colors"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Linkedin className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="https://github.com/AasathaSingh02"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="mailto:aasathasingh02@gmail.com"
                aria-label="Email"
                className="p-2 bg-gray-800 rounded-lg hover:bg-blue-600 transition-colors"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mail className="h-5 w-5" />
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-gray-700 text-center text-gray-400"
        >
          <p>&copy; 2026 ReviewCV AI. All rights reserved.</p>
        </motion.div>
      </div>

      {/* 🔒 Privacy Policy Modal */}
      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              Privacy Policy
            </DialogTitle>
            <DialogDescription className="text-sm">
              Last updated: November 2026
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground pt-2">
            <section>
              <h4 className="font-semibold text-foreground mb-1">1. Information We Collect</h4>
              <p>
                When you use ReviewCV AI, we process the resume documents (PDF format) and job descriptions you submit solely to provide ATS analysis, AI feedback, and bullet-point rewrite suggestions.
              </p>
            </section>
            <section>
              <h4 className="font-semibold text-foreground mb-1">2. How Your Data is Used</h4>
              <p>
                Your resume text is parsed in memory to compute ATS metrics and is processed with secure AI APIs. We never sell, rent, or monetize your personal or professional data to recruiters or third-party advertisers.
              </p>
            </section>
            <section>
              <h4 className="font-semibold text-foreground mb-1">3. Data Security & Storage</h4>
              <p>
                All network transmissions use standard SSL/TLS encryption. Your account credentials and resume reports are protected with secure authentication. You can delete your analysis reports from your History page at any time.
              </p>
            </section>
            <section>
              <h4 className="font-semibold text-foreground mb-1">4. Contact Us</h4>
              <p>
                If you have questions about your data privacy, contact us at{' '}
                <a href="mailto:aasathasingh02@gmail.com" className="text-primary underline">
                  aasathasingh02@gmail.com
                </a>.
              </p>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* 📄 Terms of Service Modal */}
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <FileText className="w-5 h-5 text-blue-500" />
              Terms of Service
            </DialogTitle>
            <DialogDescription className="text-sm">
              Last updated: November 2026
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground pt-2">
            <section>
              <h4 className="font-semibold text-foreground mb-1">1. Acceptance of Terms</h4>
              <p>
                By accessing or using ReviewCV AI, you agree to these Terms of Service. If you do not agree, please do not use the application.
              </p>
            </section>
            <section>
              <h4 className="font-semibold text-foreground mb-1">2. Permitted Use</h4>
              <p>
                ReviewCV AI is designed to assist job seekers with resume optimization, ATS scoring, and career development. You agree not to upload malicious files, abuse automated scripts, or attempt unauthorized server access.
              </p>
            </section>
            <section>
              <h4 className="font-semibold text-foreground mb-1">3. AI Analysis Advisory Disclaimer</h4>
              <p>
                The ATS scores, tone analyses, and rewrite suggestions provided by ReviewCV AI are recommendations generated by artificial intelligence. While designed to enhance interview chances, they do not guarantee employment or hiring outcomes.
              </p>
            </section>
            <section>
              <h4 className="font-semibold text-foreground mb-1">4. Intellectual Property</h4>
              <p>
                You retain complete and full ownership of all resume content, documents, and professional information you upload to the platform.
              </p>
            </section>
            <section>
              <h4 className="font-semibold text-foreground mb-1">5. Contact Information</h4>
              <p>
                For support or inquiries regarding these terms, please contact{' '}
                <a href="mailto:aasathasingh02@gmail.com" className="text-primary underline">
                  aasathasingh02@gmail.com
                </a>.
              </p>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
};