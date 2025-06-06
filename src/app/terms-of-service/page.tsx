'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, Calendar, Shield } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-4xl text-primary flex items-center justify-center">
              <Shield className="mr-3 h-8 w-8" />
              Terms of Service
            </CardTitle>
            <CardDescription className="text-lg">
              Last updated: January 2025
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using KLUTZ ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                KLUTZ is a suite of AI-powered tools including MediScan AI, AI Problem Solver, AI Translator, Text-to-Image Generator, 
                Thumbnail Checker, Content Ethnicity Certifier, Neurodiversity Checker, Heatmap Generator, Appliance Troubleshooter, 
                Vehicle Troubleshooter, Measuring Tool, Ingredients Checker, Image to Text Converter, and AI Date & Time Checker.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">2. Description of Service</h2>
              <p>
                KLUTZ provides AI-powered analysis tools for various purposes including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Medical Image Analysis</strong> - MediScan AI for analyzing medical images</li>
                <li><strong>Academic Problem Solving</strong> - AI Problem Solver for math, science, and academic problems</li>
                <li><strong>Translation Services</strong> - AI Translator supporting 60+ languages</li>
                <li><strong>Image Generation</strong> - Text-to-Image Generator for creating images from descriptions</li>
                <li><strong>Content Analysis</strong> - Various tools for analyzing thumbnails, ethnicity representation, neurodiversity-friendliness</li>
                <li><strong>Troubleshooting Tools</strong> - For electronic appliances and vehicles</li>
                <li><strong>Utility Tools</strong> - Measuring, ingredients checking, text extraction, and date/time analysis</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">3. User Responsibilities</h2>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">3.1 Appropriate Use</h3>
                <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You shall not:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Upload harmful, illegal, or inappropriate content</li>
                  <li>Attempt to reverse engineer or exploit the AI systems</li>
                  <li>Use the service for commercial purposes without authorization</li>
                  <li>Share false or misleading information</li>
                </ul>

                <h3 className="font-semibold text-lg">3.2 Medical Disclaimer</h3>
                <p>
                  <strong>IMPORTANT:</strong> MediScan AI and any medical-related analysis provided by our tools are for informational 
                  purposes only and should never replace professional medical advice, diagnosis, or treatment. Always consult with 
                  qualified healthcare professionals for medical concerns.
                </p>

                <h3 className="font-semibold text-lg">3.3 Educational Content</h3>
                <p>
                  AI Problem Solver and other educational tools provide AI-generated solutions that should be verified with teachers, 
                  textbooks, or other authoritative sources. These tools are meant to assist learning, not replace proper education.
                </p>
              </div>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">4. Privacy and Data</h2>
              <p>
                Your privacy is important to us. Our use of your data is governed by our Privacy Policy. By using the Service, 
                you consent to the collection and use of information as outlined in our Privacy Policy. Images and text processed 
                through our AI tools may be temporarily stored for processing purposes but are not permanently retained.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">5. AI-Generated Content Disclaimer</h2>
              <p>
                All content generated by our AI tools (including but not limited to medical analysis, problem solutions, translations, 
                generated images, troubleshooting advice, and content analysis) is provided "as is" without warranties of any kind. 
                AI-generated content may contain errors, inaccuracies, or biases. Users should:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Verify important information with authoritative sources</li>
                <li>Use professional judgment when applying AI suggestions</li>
                <li>Understand that AI analysis is not a substitute for human expertise</li>
                <li>Be aware that cultural and contextual nuances may be missed by AI systems</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">6. Limitation of Liability</h2>
              <p>
                KLUTZ and its operators shall not be liable for any direct, indirect, incidental, special, consequential, or punitive 
                damages resulting from your use of the Service. This includes but is not limited to damages from reliance on AI-generated 
                medical advice, academic solutions, translations, or any other AI-generated content.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">7. Third-Party Services</h2>
              <p>
                Our Service integrates with Puter.js and other third-party services. Your use of these services is subject to their 
                respective terms of service and privacy policies. We are not responsible for the practices or content of third-party services.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">8. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. 
                Your continued use of the Service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="font-headline text-2xl text-primary mb-4">9. Contact Information</h2>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-accent" />
                <span>For questions about these Terms of Service, contact us at: </span>
                <a href="mailto:jeffrinjames99@gmail.com" className="text-primary hover:underline font-semibold">
                  jeffrinjames99@gmail.com
                </a>
              </div>
            </section>

            <Separator />

            <section className="text-center text-muted-foreground">
              <p className="flex items-center justify-center">
                <Calendar className="h-4 w-4 mr-2" />
                Last updated: January 2025
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}