import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { SplideComponent } from '../../components/splide/splide.component';
import { SupportChatComponent } from '../../components/support-chat/support-chat.component';
import { UserService } from '../../Services/user.service'; // Adjust path as needed
import { Blog } from '../../models/blog.model';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component'; // Adjust path as needed

// Interface để map dữ liệu từ API sang format hiện tại
interface BlogDisplay {
  id: string;
  title: string;
  desc: string;
  img: string;
  author: string;
  createdAt: string;
  tags: string[];
  category: string;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    SplideComponent,
    RouterLink,
    SupportChatComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent implements OnInit {
  private userService = inject(UserService);

  latestBlogs: BlogDisplay[] = [];
  isLoadingBlogs = false;
  blogError: string | null = null;

  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.loadLatestBlogs();
  }

  loadLatestBlogs() {
    this.isLoadingBlogs = true;
    this.blogError = null;

    this.userService.getBlogs().subscribe({
      next: (blogs: Blog[]) => {
        // Map and get latest 2 blogs
        const mappedBlogs = blogs.map((blog) => this.mapBlogToDisplay(blog));

        // Sort by creation date (newest first) and take first 2
        this.latestBlogs = mappedBlogs
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 2);

        this.isLoadingBlogs = false;
      },
      error: (error) => {
        console.error('Error loading latest blogs:', error);
        this.blogError = 'Unable to load latest blogs. Please try again.';
        this.isLoadingBlogs = false;
      },
    });
  }

  private mapBlogToDisplay(blog: Blog): BlogDisplay {
    // Safely extract tags array
    const tagsArray = this.extractTags(blog.blog_tags);

    return {
      id: blog.blog_id,
      title: blog.blog_title,
      desc: this.truncateDescription(blog.excerpt, 150), // Truncate for homepage
      img: blog.image_link || '',
      author: blog.doctor_details.full_name,
      createdAt: blog.created_at,
      tags: tagsArray,
      category: this.getCategoryFromTags(tagsArray),
    };
  }

  private extractTags(blogTags: any): string[] {
    if (!blogTags) return [];

    if (Array.isArray(blogTags.tags)) {
      return blogTags.tags;
    }

    if (Array.isArray(blogTags)) {
      return blogTags;
    }

    if (typeof blogTags === 'string') {
      return blogTags.split(',').map((tag) => tag.trim());
    }

    if (typeof blogTags.tags === 'string') {
      return blogTags.tags.split(',').map((tag: string) => tag.trim());
    }

    return [];
  }

  private getCategoryFromTags(tags: string[]): string {
    if (!Array.isArray(tags) || tags.length === 0) {
      return 'Community';
    }

    const tagMap: { [key: string]: string } = {
      transgender: 'Gender Stories',
      'hormone therapy': 'Gender Stories',
      'mental health': 'Mental Health',
      community: 'Community',
      legal: 'Legal',
      education: 'Education',
    };

    for (const tag of tags) {
      if (typeof tag === 'string') {
        const category = tagMap[tag.toLowerCase()];
        if (category) return category;
      }
    }

    return 'Community';
  }

  private truncateDescription(text: string, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }
}
