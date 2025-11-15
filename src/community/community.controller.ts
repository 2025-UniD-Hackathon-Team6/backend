import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, ParseIntPipe } from '@nestjs/common';
import { CommunityService } from './community.service';
import { type AuthenticatedRequest } from '@libs/jwt';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('커뮤니티')
@Controller('community')
export class CommunityController {
    constructor(private readonly communityService: CommunityService) {}

    // ========== 게시글 API ==========

    @Get('posts')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: '게시글 목록 조회', description: '커뮤니티 게시글 목록을 페이지네이션하여 조회합니다.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 게시글 수 (기본값: 10)' })
    @ApiResponse({ status: 200, description: '게시글 목록 조회 성공' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    async getPosts(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        const pageNum = page ? parseInt(page.toString(), 10) : 1;
        const limitNum = limit ? parseInt(limit.toString(), 10) : 10;
        return await this.communityService.getPosts(pageNum, limitNum);
    }

    @Get('posts/:id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: '게시글 상세 조회', description: '특정 게시글의 상세 정보와 댓글을 조회합니다. 조회 시 조회수가 증가합니다.' })
    @ApiParam({ name: 'id', type: Number, description: '게시글 ID' })
    @ApiResponse({ status: 200, description: '게시글 조회 성공' })
    @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    async getPostById(@Param('id', ParseIntPipe) id: number) {
        return await this.communityService.getPostById(id);
    }

    @Post('posts')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: '게시글 작성', description: '새로운 커뮤니티 게시글을 작성합니다.' })
    @ApiBody({ type: CreatePostDto })
    @ApiResponse({ status: 201, description: '게시글 작성 성공' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    async createPost(
        @Req() req: AuthenticatedRequest,
        @Body() createPostDto: CreatePostDto,
    ) {
        return await this.communityService.createPost(req.user.id, createPostDto);
    }

    @Put('posts/:id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: '게시글 수정', description: '작성한 게시글을 수정합니다.' })
    @ApiParam({ name: 'id', type: Number, description: '게시글 ID' })
    @ApiBody({ type: UpdatePostDto })
    @ApiResponse({ status: 200, description: '게시글 수정 성공' })
    @ApiResponse({ status: 403, description: '권한 없음' })
    @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    async updatePost(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: AuthenticatedRequest,
        @Body() updatePostDto: UpdatePostDto,
    ) {
        return await this.communityService.updatePost(id, req.user.id, updatePostDto);
    }

    @Delete('posts/:id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: '게시글 삭제', description: '작성한 게시글을 삭제합니다.' })
    @ApiParam({ name: 'id', type: Number, description: '게시글 ID' })
    @ApiResponse({ status: 200, description: '게시글 삭제 성공' })
    @ApiResponse({ status: 403, description: '권한 없음' })
    @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    async deletePost(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: AuthenticatedRequest,
    ) {
        return await this.communityService.deletePost(id, req.user.id);
    }

    // ========== 댓글 API ==========

    @Get('posts/:postId/comments')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: '댓글 목록 조회', description: '특정 게시글의 댓글 목록을 조회합니다.' })
    @ApiParam({ name: 'postId', type: Number, description: '게시글 ID' })
    @ApiResponse({ status: 200, description: '댓글 목록 조회 성공' })
    @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    async getComments(@Param('postId', ParseIntPipe) postId: number) {
        return await this.communityService.getComments(postId);
    }

    @Post('posts/:postId/comments')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: '댓글 작성', description: '게시글에 댓글을 작성합니다.' })
    @ApiParam({ name: 'postId', type: Number, description: '게시글 ID' })
    @ApiBody({ type: CreateCommentDto })
    @ApiResponse({ status: 201, description: '댓글 작성 성공' })
    @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    async createComment(
        @Param('postId', ParseIntPipe) postId: number,
        @Req() req: AuthenticatedRequest,
        @Body() createCommentDto: CreateCommentDto,
    ) {
        return await this.communityService.createComment(postId, req.user.id, createCommentDto);
    }

    @Put('comments/:id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: '댓글 수정', description: '작성한 댓글을 수정합니다.' })
    @ApiParam({ name: 'id', type: Number, description: '댓글 ID' })
    @ApiBody({ type: UpdateCommentDto })
    @ApiResponse({ status: 200, description: '댓글 수정 성공' })
    @ApiResponse({ status: 403, description: '권한 없음' })
    @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    async updateComment(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: AuthenticatedRequest,
        @Body() updateCommentDto: UpdateCommentDto,
    ) {
        return await this.communityService.updateComment(id, req.user.id, updateCommentDto);
    }

    @Delete('comments/:id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: '댓글 삭제', description: '작성한 댓글을 삭제합니다.' })
    @ApiParam({ name: 'id', type: Number, description: '댓글 ID' })
    @ApiResponse({ status: 200, description: '댓글 삭제 성공' })
    @ApiResponse({ status: 403, description: '권한 없음' })
    @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    async deleteComment(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: AuthenticatedRequest,
    ) {
        return await this.communityService.deleteComment(id, req.user.id);
    }
}
