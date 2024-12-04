package org.launchcode.event_finder.Controllers;

import org.launchcode.event_finder.Models.Contact;
import org.launchcode.event_finder.Models.DTO.EmailRequest;
import org.launchcode.event_finder.Repositories.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/contact")
public class ContactController {
    @Autowired
    private final ContactRepository contactRepository;

    @Autowired
    private JavaMailSender mailSender;

    public ContactController(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    @PostMapping
    public ResponseEntity<String> handleContactForm(@RequestBody Contact contact) {
        contactRepository.save(contact);
        return ResponseEntity.ok("Thank you for reaching out! We will get back to you soon.");
    }
    @GetMapping
    public List<Contact> getAllMessages() {
        return contactRepository.findAll();
    }

    @PostMapping("/send-email")
    public ResponseEntity<String> sendEmail(@RequestBody EmailRequest emailRequest) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("anumolpm0@gmail.com");
            message.setTo(emailRequest.getRecipient());
            message.setSubject(emailRequest.getSubject());
            message.setText(emailRequest.getMessage());

            // Send the email
            mailSender.send(message);

            return ResponseEntity.ok("Email sent successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to send email.");
        }
    }
}
