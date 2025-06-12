'use client';

import Head from 'next/head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Mail, HelpCircle } from 'lucide-react';

export default function FAQPage() {
  return (
    <>
      <Head>
        <link rel="canonical" href="https://klutz.netlify.app/faq" />
      </Head>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-4xl text-primary flex items-center justify-center">
              <HelpCircle className="mr-3 h-8 w-8" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription className="text-lg">
              Common questions about KLUTZ AI tools and services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full space-y-4">
              
              {/* General Questions */}
              <AccordionItem value="general-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  What is KLUTZ and what tools does it offer?
                </AccordionTrigger>
                <AccordionContent>
                  KLUTZ is a comprehensive suite of AI-powered tools designed to help with various analysis and generation tasks. Our tools include:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li><strong>MediScan AI</strong> - Medical image analysis</li>
                    <li><strong>AI Problem Solver</strong> - Academic problem solving</li>
                    <li><strong>AI Translator</strong> - Multi-language translation</li>
                    <li><strong>Text-to-Image Generator</strong> - Image creation from descriptions</li>
                    <li><strong>Thumbnail Checker</strong> - Content consistency analysis</li>
                    <li><strong>Content Ethnicity Certifier</strong> - Representation analysis</li>
                    <li><strong>Neurodiversity Checker</strong> - Accessibility assessment</li>
                    <li><strong>Heatmap Generator</strong> - Engagement visualization</li>
                    <li><strong>Appliance & Vehicle Troubleshooters</strong> - Diagnostic assistance</li>
                    <li><strong>Measuring Tool</strong> - Object measurement from images</li>
                    <li><strong>Ingredients Checker</strong> - Food safety analysis</li>
                    <li><strong>Image to Text Converter</strong> - Text extraction</li>
                    <li><strong>AI Date & Time Checker</strong> - Historical date analysis</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="general-2" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  How do I get started with KLUTZ?
                </AccordionTrigger>
                <AccordionContent>
                  Getting started is simple:
                  <ol className="list-decimal pl-6 mt-2 space-y-1">
                    <li>Click "Login with Puter" to create or sign into your account</li>
                    <li>Choose any tool from the homepage</li>
                    <li>Upload your content (images, text, etc.) as required</li>
                    <li>Click the analysis button to get AI-powered results</li>
                    <li>Download reports or copy results as needed</li>
                  </ol>
                  No installation required - everything works in your browser!
                </AccordionContent>
              </AccordionItem>

              {/* MediScan AI */}
              <AccordionItem value="mediscan-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  Is MediScan AI a replacement for professional medical advice?
                </AccordionTrigger>
                <AccordionContent>
                  <strong>No, absolutely not.</strong> MediScan AI is for informational purposes only and should never replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for any medical concerns. The AI analysis is meant to provide general insights that may be helpful for educational purposes or preliminary review, but medical decisions should always be made by licensed medical professionals.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="mediscan-2" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  What types of medical images can I upload to MediScan AI?
                </AccordionTrigger>
                <AccordionContent>
                  MediScan AI supports various medical imaging formats including X-rays, MRI scans, CT scans, and ultrasounds. Supported file formats are PNG, JPEG, and DICOM files up to 10MB. For best results, ensure images are clear and properly oriented. Remove any personal identifying information before uploading.
                </AccordionContent>
              </AccordionItem>

              {/* AI Problem Solver */}
              <AccordionItem value="problem-solver-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  What subjects does the AI Problem Solver support?
                </AccordionTrigger>
                <AccordionContent>
                  The AI Problem Solver supports a wide range of academic subjects including:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Mathematics (Algebra, Calculus, Geometry, Trigonometry, Statistics)</li>
                    <li>Sciences (Physics, Chemistry, Biology)</li>
                    <li>Computer Science and Engineering</li>
                    <li>Economics and Logic</li>
                    <li>Word problems and reasoning tasks</li>
                  </ul>
                  You can upload images of problems or type them directly. Text input generally provides more reliable and accurate results than image analysis.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="problem-solver-2" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  Should I rely on AI Problem Solver solutions for my homework?
                </AccordionTrigger>
                <AccordionContent>
                  The AI Problem Solver is designed to assist learning, not replace it. Always verify solutions with teachers, textbooks, or other authoritative sources. Use it as a study aid to understand problem-solving approaches, but make sure you understand the concepts yourself. For important assignments or exams, double-check all work independently.
                </AccordionContent>
              </AccordionItem>

              {/* AI Translator */}
              <AccordionItem value="translator-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  How many languages does the AI Translator support?
                </AccordionTrigger>
                <AccordionContent>
                  The AI Translator supports over 60 languages including major world languages like English, Spanish, French, German, Chinese, Japanese, Arabic, Hindi, and many others. You can translate text directly or extract and translate text from images. The tool also provides cultural context and alternative translations for better understanding.
                </AccordionContent>
              </AccordionItem>

              {/* Text-to-Image Generator */}
              <AccordionItem value="image-gen-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  What kind of images can the Text-to-Image Generator create?
                </AccordionTrigger>
                <AccordionContent>
                  The Text-to-Image Generator can create a wide variety of images from text descriptions including:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Photorealistic images and digital art</li>
                    <li>Various art styles (oil painting, watercolor, cartoon, anime, abstract)</li>
                    <li>Different aspect ratios (square, landscape, portrait, wide)</li>
                    <li>Custom scenes, objects, characters, and concepts</li>
                  </ul>
                  For best results, be specific about colors, style, composition, and mood in your descriptions.
                </AccordionContent>
              </AccordionItem>

              {/* Content Analysis Tools */}
              <AccordionItem value="content-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  How accurate are the Content Ethnicity Certifier and Neurodiversity Checker?
                </AccordionTrigger>
                <AccordionContent>
                  These tools provide AI-generated assessments that should be critically reviewed with human expertise. They offer preliminary analysis for content creators but have limitations and potential biases. Always consult with neurodivergent individuals and cultural experts for comprehensive evaluations. Use these tools as starting points for discussion, not definitive judgments.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="content-2" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  What does the Heatmap Generator show?
                </AccordionTrigger>
                <AccordionContent>
                  The Heatmap Generator predicts user engagement patterns for images and text. For images, it identifies areas likely to attract high or low visual attention with approximate location markers. For text, it highlights segments with different engagement levels using color coding. These are AI predictions and should be combined with actual user testing for best results.
                </AccordionContent>
              </AccordionItem>

              {/* Troubleshooting Tools */}
              <AccordionItem value="troubleshoot-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  Can the Appliance and Vehicle Troubleshooters replace professional repair services?
                </AccordionTrigger>
                <AccordionContent>
                  No, these tools provide general guidance only and should not replace professional inspection or repair services. For serious electrical issues, safety concerns, or complex mechanical problems, always consult qualified technicians or mechanics. The troubleshooters are meant to help with basic diagnostics and understanding potential issues.
                </AccordionContent>
              </AccordionItem>

              {/* Utility Tools */}
              <AccordionItem value="utility-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  How accurate is the AI Measuring Tool?
                </AccordionTrigger>
                <AccordionContent>
                  The AI Measuring Tool provides estimates based on visual analysis and available reference points in images. Accuracy depends on image quality, perspective, and the presence of objects with known dimensions. For precise measurements, always use proper measuring tools. This tool is best for rough estimates and general sizing purposes.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="utility-2" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  Is the Ingredients Checker reliable for food safety decisions?
                </AccordionTrigger>
                <AccordionContent>
                  The Ingredients Checker provides AI analysis for informational purposes but should not be the sole basis for food safety decisions. Always verify ingredients with manufacturers and consult healthcare professionals for specific dietary needs or allergies. The tool is more accurate with ingredient labels than with images of actual food items, especially complex or unfamiliar dishes.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="utility-3" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  What can the AI Date & Time Checker tell me?
                </AccordionTrigger>
                <AccordionContent>
                  The AI Date & Time Checker can provide detailed information about any date from 1 AD to 2999 AD, including:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>What day of the week it was/is/will be</li>
                    <li>Historical events and cultural significance</li>
                    <li>Astronomical information and seasons</li>
                    <li>Calendar system details and millennium/century information</li>
                  </ul>
                  You can also find all dates in a specific month/year that fall on a particular day of the week.
                </AccordionContent>
              </AccordionItem>

              {/* Technical Questions */}
              <AccordionItem value="tech-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  What happens to my uploaded images and data?
                </AccordionTrigger>
                <AccordionContent>
                  Your uploaded content is processed temporarily for AI analysis and is not permanently stored on our servers. Images and text are typically processed and discarded within minutes of upload. We use secure, encrypted transmission and do not share your content with third parties for training purposes. See our Privacy Policy for complete details.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tech-2" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  Why do I need to sign in with Puter?
                </AccordionTrigger>
                <AccordionContent>
                  Puter authentication provides secure access to AI processing capabilities and ensures proper usage limits. It also allows us to provide personalized experiences while maintaining your privacy. Puter accounts are free to create and provide access to powerful AI models that power all KLUTZ tools.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tech-3" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  What should I do if I get an error message?
                </AccordionTrigger>
                <AccordionContent>
                  If you encounter errors:
                  <ol className="list-decimal pl-6 mt-2 space-y-1">
                    <li>Try refreshing the page and attempting the action again</li>
                    <li>Check your internet connection</li>
                    <li>Ensure your uploaded files meet size and format requirements</li>
                    <li>If you see "usage limit" errors, try creating a new Puter account</li>
                    <li>Contact us if problems persist</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              {/* Pricing and Limits */}
              <AccordionItem value="pricing-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  Is KLUTZ free to use?
                </AccordionTrigger>
                <AccordionContent>
                  KLUTZ tools are free to use with Puter authentication. However, AI processing may have usage limits depending on your Puter account. If you encounter usage limits, you can create a new Puter account or check Puter's pricing for expanded access to AI capabilities.
                </AccordionContent>
              </AccordionItem>

              {/* Support */}
              <AccordionItem value="support-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  How can I get help or report issues?
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-accent" />
                    <span>Contact us at: </span>
                    <a href="mailto:jeffrinjames99@gmail.com" className="text-primary hover:underline font-semibold">
                      jeffrinjames99@gmail.com
                    </a>
                  </div>
                  <p className="mt-2">
                    Please include details about the issue, which tool you were using, and any error messages you received. 
                    We aim to respond to all inquiries within 24-48 hours.
                  </p>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
    </>
)}