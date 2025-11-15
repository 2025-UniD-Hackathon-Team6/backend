import { PrismaService } from '@libs/prisma';
import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommunityService {
    private readonly logger = new Logger(CommunityService.name);

    constructor(private readonly prisma: PrismaService) {}

    // ========== 게시글 CRUD ==========

    /**
     * 게시글 목록 조회 (페이지네이션)
     */
    async getPosts(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            this.prisma.communityPost.findMany({
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    comments: {
                        select: {
                            id: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.communityPost.count(),
        ]);

        return {
            posts: posts.map((post) => ({
                ...post,
                commentCount: post.comments.length,
                comments: undefined, // comments 배열 제거
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * 게시글 상세 조회 (조회수 증가 포함)
     */
    async getPostById(postId: number) {
        const post = await this.prisma.communityPost.findUnique({
            where: { id: postId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });

        if (!post) {
            throw new NotFoundException('게시글을 찾을 수 없습니다');
        }

        // 조회수 증가
        await this.prisma.communityPost.update({
            where: { id: postId },
            data: { viewCount: { increment: 1 } },
        });

        return {
            ...post,
            viewCount: post.viewCount + 1, // 증가된 조회수 반영
        };
    }

    /**
     * 게시글 생성
     */
    async createPost(userId: number, createPostDto: CreatePostDto) {
        const post = await this.prisma.communityPost.create({
            data: {
                userId,
                title: createPostDto.title,
                content: createPostDto.content,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        this.logger.log(`게시글 생성: ID ${post.id}, 작성자 ID ${userId}`);
        return post;
    }

    /**
     * 게시글 수정
     */
    async updatePost(postId: number, userId: number, updatePostDto: UpdatePostDto) {
        const post = await this.prisma.communityPost.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('게시글을 찾을 수 없습니다');
        }

        if (post.userId !== userId) {
            throw new ForbiddenException('게시글을 수정할 권한이 없습니다');
        }

        const updatedPost = await this.prisma.communityPost.update({
            where: { id: postId },
            data: updatePostDto,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        this.logger.log(`게시글 수정: ID ${postId}, 작성자 ID ${userId}`);
        return updatedPost;
    }

    /**
     * 게시글 삭제
     */
    async deletePost(postId: number, userId: number) {
        const post = await this.prisma.communityPost.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('게시글을 찾을 수 없습니다');
        }

        if (post.userId !== userId) {
            throw new ForbiddenException('게시글을 삭제할 권한이 없습니다');
        }

        await this.prisma.communityPost.delete({
            where: { id: postId },
        });

        this.logger.log(`게시글 삭제: ID ${postId}, 작성자 ID ${userId}`);
        return { message: '게시글이 삭제되었습니다' };
    }

    // ========== 댓글 CRUD ==========

    /**
     * 특정 게시글의 댓글 목록 조회
     */
    async getComments(postId: number) {
        const post = await this.prisma.communityPost.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('게시글을 찾을 수 없습니다');
        }

        const comments = await this.prisma.communityComment.findMany({
            where: { postId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return comments;
    }

    /**
     * 댓글 생성
     */
    async createComment(postId: number, userId: number, createCommentDto: CreateCommentDto) {
        const post = await this.prisma.communityPost.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException('게시글을 찾을 수 없습니다');
        }

        const comment = await this.prisma.communityComment.create({
            data: {
                postId,
                userId,
                content: createCommentDto.content,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        this.logger.log(`댓글 생성: ID ${comment.id}, 게시글 ID ${postId}, 작성자 ID ${userId}`);
        return comment;
    }

    /**
     * 댓글 수정
     */
    async updateComment(commentId: number, userId: number, updateCommentDto: UpdateCommentDto) {
        const comment = await this.prisma.communityComment.findUnique({
            where: { id: commentId },
        });

        if (!comment) {
            throw new NotFoundException('댓글을 찾을 수 없습니다');
        }

        if (comment.userId !== userId) {
            throw new ForbiddenException('댓글을 수정할 권한이 없습니다');
        }

        const updatedComment = await this.prisma.communityComment.update({
            where: { id: commentId },
            data: { content: updateCommentDto.content },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        this.logger.log(`댓글 수정: ID ${commentId}, 작성자 ID ${userId}`);
        return updatedComment;
    }

    /**
     * 댓글 삭제
     */
    async deleteComment(commentId: number, userId: number) {
        const comment = await this.prisma.communityComment.findUnique({
            where: { id: commentId },
        });

        if (!comment) {
            throw new NotFoundException('댓글을 찾을 수 없습니다');
        }

        if (comment.userId !== userId) {
            throw new ForbiddenException('댓글을 삭제할 권한이 없습니다');
        }

        await this.prisma.communityComment.delete({
            where: { id: commentId },
        });

        this.logger.log(`댓글 삭제: ID ${commentId}, 작성자 ID ${userId}`);
        return { message: '댓글이 삭제되었습니다' };
    }
}
