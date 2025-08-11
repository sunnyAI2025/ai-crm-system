/**
 * CRM系统前端文件管理组件
 * 
 * 包含：
 * 1. 通用文件上传组件
 * 2. 头像上传组件
 * 3. 文件列表组件
 * 4. 文件预览组件
 * 5. 文件管理页面
 * 6. 文件工具类
 * 7. API接口封装
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Upload,
  Button,
  Table,
  Modal,
  Image,
  Tag,
  Space,
  Tooltip,
  Progress,
  message,
  Avatar,
  Card,
  Row,
  Col,
  Input,
  Select,
  DatePicker,
  Popconfirm,
  Typography
} from 'antd';
import {
  InboxOutlined,
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileTextOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  FileOutlined,
  UserOutlined,
  CameraOutlined,
  PlusOutlined
} from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import { usePermission } from '@/hooks/usePermission';
import { fileApi } from '@/api/file';

const { Dragger } = Upload;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

// ===============================================
// 1. 通用文件上传组件
// ===============================================

/**
 * 通用文件上传组件
 */
const FileUploadComponent = ({
  fileType = 'general',
  maxCount = 1,
  maxSize = 50 * 1024 * 1024, // 50MB
  accept = [],
  showPreview = true,
  showUploadList = true,
  referenceType,
  referenceId,
  businessModule,
  isPublic = false,
  onSuccess,
  onError,
  onChange,
  disabled = false,
  ...props
}) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const { hasPermission } = usePermission();

  // 文件类型配置
  const fileTypeConfig = useMemo(() => {
    const configs = {
      avatar: {
        accept: ['.jpg', '.jpeg', '.png', '.webp'],
        maxSize: 5 * 1024 * 1024, // 5MB
        description: '支持 JPG、PNG、WebP 格式，最大 5MB'
      },
      image: {
        accept: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
        maxSize: 10 * 1024 * 1024, // 10MB
        description: '支持图片格式，最大 10MB'
      },
      document: {
        accept: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
        maxSize: 50 * 1024 * 1024, // 50MB
        description: '支持 Office 文档和 PDF，最大 50MB'
      },
      general: {
        accept: accept.length > 0 ? accept : ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'],
        maxSize: maxSize,
        description: `最大文件大小 ${formatFileSize(maxSize)}`
      }
    };
    return configs[fileType] || configs.general;
  }, [fileType, accept, maxSize]);

  // 文件上传前验证
  const beforeUpload = useCallback((file) => {
    // 检查权限
    if (!hasPermission('files:upload')) {
      message.error('无权限上传文件');
      return false;
    }

    // 检查文件大小
    if (file.size > fileTypeConfig.maxSize) {
      message.error(`文件大小不能超过 ${formatFileSize(fileTypeConfig.maxSize)}`);
      return false;
    }

    // 检查文件类型
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (fileTypeConfig.accept.length > 0 && !fileTypeConfig.accept.includes(fileExtension)) {
      message.error(`不支持的文件格式，请上传 ${fileTypeConfig.accept.join('、')} 格式的文件`);
      return false;
    }

    // 检查文件名长度
    if (file.name.length > 100) {
      message.error('文件名长度不能超过100个字符');
      return false;
    }

    // 检查文件名安全性
    if (!isSafeFileName(file.name)) {
      message.error('文件名包含非法字符');
      return false;
    }

    return true;
  }, [fileTypeConfig, hasPermission]);

  // 自定义上传处理
  const customRequest = useCallback(async ({ file, onProgress, onSuccess, onError: onUploadError }) => {
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);
      if (referenceType) formData.append('referenceType', referenceType);
      if (referenceId) formData.append('referenceId', referenceId);
      if (businessModule) formData.append('businessModule', businessModule);
      formData.append('isPublic', isPublic.toString());

      // 模拟上传进度
      const progressTimer = setInterval(() => {
        const progress = Math.min(90, Math.random() * 100);
        onProgress({ percent: progress });
      }, 100);

      const result = await fileApi.upload(formData);
      
      clearInterval(progressTimer);
      onProgress({ percent: 100 });

      if (result.code === 0) {
        onSuccess(result.data, file);
        message.success('文件上传成功');
        onSuccess && onSuccess(result.data, file);
      } else {
        throw new Error(result.message || '上传失败');
      }
    } catch (error) {
      console.error('文件上传错误:', error);
      onUploadError(error, file);
      message.error(error.message || '文件上传失败');
      onError && onError(error, file);
    } finally {
      setUploading(false);
    }
  }, [fileType, referenceType, referenceId, businessModule, isPublic, onSuccess, onError]);

  // 文件状态变化处理
  const handleChange = useCallback(({ fileList: newFileList }) => {
    const processedFileList = newFileList.map(file => {
      if (file.response && file.response.code === 0) {
        return {
          ...file,
          url: file.response.data.fileUrl,
          status: 'done',
          uid: file.response.data.id
        };
      }
      return file;
    });

    setFileList(processedFileList);
    onChange && onChange(processedFileList);
  }, [onChange]);

  // 文件预览
  const handlePreview = useCallback(async (file) => {
    if (!showPreview) return;

    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  }, [showPreview]);

  // 文件删除
  const handleRemove = useCallback(async (file) => {
    if (!hasPermission('files:delete')) {
      message.error('无权限删除文件');
      return false;
    }

    if (file.response && file.response.data && file.response.data.id) {
      try {
        await fileApi.deleteFile(file.response.data.id);
        message.success('文件删除成功');
      } catch (error) {
        console.error('文件删除失败:', error);
        message.error('文件删除失败');
        return false;
      }
    }
    return true;
  }, [hasPermission]);

  const uploadProps = {
    ...props,
    fileList,
    beforeUpload,
    customRequest,
    onChange: handleChange,
    onPreview: showPreview ? handlePreview : undefined,
    onRemove: handleRemove,
    maxCount,
    multiple: maxCount > 1,
    accept: fileTypeConfig.accept.join(','),
    disabled: disabled || uploading,
    showUploadList
  };

  return (
    <>
      <div className="file-upload-container">
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            点击或拖拽文件到此区域上传
          </p>
          <p className="ant-upload-hint">
            {fileTypeConfig.description}
          </p>
        </Dragger>

        {uploading && (
          <div style={{ marginTop: 16 }}>
            <Progress percent={0} status="active" />
          </div>
        )}
      </div>

      {/* 图片预览弹窗 */}
      <Modal
        visible={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
};

// ===============================================
// 2. 头像上传组件
// ===============================================

/**
 * 头像上传组件
 */
const AvatarUpload = ({ 
  value, 
  onChange, 
  size = 100,
  showEdit = true,
  cropAspect = 1,
  cropShape = 'round',
  disabled = false,
  referenceType = 'user_avatar',
  referenceId
}) => {
  const [loading, setLoading] = useState(false);
  const { hasPermission } = usePermission();

  const beforeUpload = (file) => {
    if (!hasPermission('files:upload')) {
      message.error('无权限上传头像');
      return false;
    }

    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG/WebP 格式的图片');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB');
      return false;
    }
    return true;
  };

  const customRequest = async ({ file, onSuccess, onError }) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'avatar');
      formData.append('referenceType', referenceType);
      if (referenceId) formData.append('referenceId', referenceId);

      const result = await fileApi.upload(formData);
      
      if (result.code === 0) {
        onSuccess(result.data);
        onChange && onChange(result.data.fileUrl, result.data);
        message.success('头像上传成功');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      onError(error);
      message.error('头像上传失败');
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div style={{ 
      width: size, 
      height: size, 
      border: '1px dashed #d9d9d9',
      borderRadius: cropShape === 'round' ? '50%' : '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      position: 'relative',
      backgroundColor: disabled ? '#f5f5f5' : 'transparent'
    }}>
      {loading ? (
        <div style={{ textAlign: 'center' }}>
          <div>上传中...</div>
        </div>
      ) : (
        <>
          {value ? (
            <Avatar size={size - 2} src={value} />
          ) : (
            <Avatar size={size - 2} icon={<UserOutlined />} />
          )}
          {showEdit && !disabled && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              background: '#1890ff',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <CameraOutlined style={{ color: 'white', fontSize: 12 }} />
            </div>
          )}
        </>
      )}
    </div>
  );

  if (disabled || !hasPermission('files:upload')) {
    return uploadButton;
  }

  return (
    <ImgCrop 
      aspect={cropAspect}
      shape={cropShape}
      quality={0.9}
      modalTitle="编辑头像"
      modalOk="确定"
      modalCancel="取消"
    >
      <Upload
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        beforeUpload={beforeUpload}
        customRequest={customRequest}
        disabled={loading || disabled}
      >
        {uploadButton}
      </Upload>
    </ImgCrop>
  );
};

// ===============================================
// 3. 文件列表组件
// ===============================================

/**
 * 文件列表组件
 */
const FileListComponent = ({
  fileType,
  referenceType,
  referenceId,
  businessModule,
  showActions = true,
  showSearch = true,
  pageSize = 10,
  onFileSelect,
  ...props
}) => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: pageSize,
    total: 0
  });
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    fileType: fileType || '',
    dateRange: null
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const { hasPermission } = usePermission();

  // 加载文件列表
  const loadFileList = useCallback(async (page = 1, size = pageSize) => {
    try {
      setLoading(true);
      
      const params = {
        page,
        size,
        fileType: searchParams.fileType || fileType,
        referenceType,
        referenceId,
        businessModule,
        keyword: searchParams.keyword
      };

      if (searchParams.dateRange) {
        params.startDate = searchParams.dateRange[0].format('YYYY-MM-DD');
        params.endDate = searchParams.dateRange[1].format('YYYY-MM-DD');
      }

      const result = await fileApi.getFileList(params);
      
      if (result.code === 0) {
        setDataSource(result.data.content);
        setPagination({
          current: page,
          pageSize: size,
          total: result.data.totalElements
        });
      }
    } catch (error) {
      console.error('加载文件列表失败:', error);
      message.error('加载文件列表失败');
    } finally {
      setLoading(false);
    }
  }, [fileType, referenceType, referenceId, businessModule, searchParams, pageSize]);

  // 初始加载
  useEffect(() => {
    loadFileList();
  }, [loadFileList]);

  // 搜索处理
  const handleSearch = useCallback((values) => {
    setSearchParams(values);
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);

  // 分页变化
  const handleTableChange = useCallback((paginationInfo) => {
    loadFileList(paginationInfo.current, paginationInfo.pageSize);
  }, [loadFileList]);

  // 下载文件
  const handleDownload = useCallback(async (record) => {
    if (!hasPermission('files:download')) {
      message.error('无权限下载文件');
      return;
    }

    try {
      await fileApi.downloadFile(record.id, record.originalName);
      message.success('下载开始');
    } catch (error) {
      console.error('下载失败:', error);
      message.error('下载失败');
    }
  }, [hasPermission]);

  // 删除文件
  const handleDelete = useCallback(async (record) => {
    if (!hasPermission('files:delete')) {
      message.error('无权限删除文件');
      return;
    }

    try {
      await fileApi.deleteFile(record.id);
      message.success('删除成功');
      loadFileList(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  }, [hasPermission, loadFileList, pagination]);

  // 批量删除
  const handleBatchDelete = useCallback(async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的文件');
      return;
    }

    if (!hasPermission('files:delete')) {
      message.error('无权限删除文件');
      return;
    }

    try {
      await fileApi.batchDeleteFiles(selectedRowKeys);
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      loadFileList(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('批量删除失败:', error);
      message.error('批量删除失败');
    }
  }, [selectedRowKeys, hasPermission, loadFileList, pagination]);

  // 预览文件
  const handlePreview = useCallback(async (record) => {
    if (!hasPermission('files:view')) {
      message.error('无权限查看文件');
      return;
    }

    onFileSelect && onFileSelect(record);

    // 如果是图片，显示预览
    if (record.mimeType && record.mimeType.startsWith('image/')) {
      Modal.info({
        title: '图片预览',
        width: 800,
        content: (
          <div style={{ textAlign: 'center' }}>
            <Image
              src={record.fileUrl}
              alt={record.originalName}
              style={{ maxWidth: '100%', maxHeight: '500px' }}
            />
          </div>
        )
      });
    }
  }, [hasPermission, onFileSelect]);

  // 获取文件图标
  const getFileIcon = useCallback((record) => {
    const mimeType = record.mimeType || '';
    
    if (mimeType.startsWith('image/')) {
      return <PictureOutlined style={{ color: '#52c41a' }} />;
    } else if (mimeType.startsWith('video/')) {
      return <VideoCameraOutlined style={{ color: '#1890ff' }} />;
    } else if (mimeType.startsWith('audio/')) {
      return <AudioOutlined style={{ color: '#722ed1' }} />;
    } else if (mimeType.includes('pdf')) {
      return <FileTextOutlined style={{ color: '#f5222d' }} />;
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return <FileTextOutlined style={{ color: '#1890ff' }} />;
    } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      return <FileTextOutlined style={{ color: '#52c41a' }} />;
    } else {
      return <FileOutlined style={{ color: '#8c8c8c' }} />;
    }
  }, []);

  // 表格列定义
  const columns = [
    {
      title: '文件',
      dataIndex: 'originalName',
      key: 'originalName',
      render: (text, record) => (
        <Space>
          {getFileIcon(record)}
          <Tooltip title={text}>
            <Text 
              ellipsis 
              style={{ maxWidth: 200, cursor: 'pointer' }}
              onClick={() => handlePreview(record)}
            >
              {text}
            </Text>
          </Tooltip>
        </Space>
      )
    },
    {
      title: '大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 100,
      render: (size) => formatFileSize(size)
    },
    {
      title: '类型',
      dataIndex: 'fileType',
      key: 'fileType',
      width: 100,
      render: (type) => <Tag color="blue">{type}</Tag>
    },
    {
      title: '上传时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (time) => new Date(time).toLocaleDateString()
    },
    {
      title: '下载次数',
      dataIndex: 'downloadCount',
      key: 'downloadCount',
      width: 100,
      align: 'center'
    }
  ];

  if (showActions) {
    columns.push({
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          {hasPermission('files:view') && (
            <Tooltip title="预览">
              <Button 
                type="text" 
                icon={<EyeOutlined />} 
                onClick={() => handlePreview(record)}
              />
            </Tooltip>
          )}
          {hasPermission('files:download') && (
            <Tooltip title="下载">
              <Button 
                type="text" 
                icon={<DownloadOutlined />} 
                onClick={() => handleDownload(record)}
              />
            </Tooltip>
          )}
          {hasPermission('files:delete') && (
            <Popconfirm
              title="确定要删除这个文件吗？"
              onConfirm={() => handleDelete(record)}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="删除">
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      )
    });
  }

  const rowSelection = showActions && hasPermission('files:delete') ? {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE
    ]
  } : null;

  return (
    <div className="file-list-container">
      {showSearch && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col flex="300px">
              <Search
                placeholder="搜索文件名"
                allowClear
                onSearch={(value) => handleSearch({ ...searchParams, keyword: value })}
              />
            </Col>
            <Col flex="150px">
              <Select
                placeholder="文件类型"
                allowClear
                style={{ width: '100%' }}
                value={searchParams.fileType}
                onChange={(value) => handleSearch({ ...searchParams, fileType: value })}
              >
                <Option value="">全部</Option>
                <Option value="avatar">头像</Option>
                <Option value="image">图片</Option>
                <Option value="document">文档</Option>
                <Option value="general">其他</Option>
              </Select>
            </Col>
            <Col flex="300px">
              <RangePicker
                placeholder={['开始日期', '结束日期']}
                value={searchParams.dateRange}
                onChange={(dates) => handleSearch({ ...searchParams, dateRange: dates })}
              />
            </Col>
            <Col flex="auto">
              {selectedRowKeys.length > 0 && (
                <Popconfirm
                  title={`确定要删除选中的 ${selectedRowKeys.length} 个文件吗？`}
                  onConfirm={handleBatchDelete}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button danger icon={<DeleteOutlined />}>
                    批量删除 ({selectedRowKeys.length})
                  </Button>
                </Popconfirm>
              )}
            </Col>
          </Row>
        </Card>
      )}

      <Table
        {...props}
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        rowSelection={rowSelection}
        size="small"
      />
    </div>
  );
};

// ===============================================
// 4. 文件预览组件
// ===============================================

/**
 * 文件预览组件
 */
const FilePreviewComponent = ({ fileInfo, visible, onClose }) => {
  const [loading, setLoading] = useState(false);

  if (!fileInfo) return null;

  const isImage = fileInfo.mimeType && fileInfo.mimeType.startsWith('image/');
  const isPdf = fileInfo.mimeType && fileInfo.mimeType.includes('pdf');
  const isVideo = fileInfo.mimeType && fileInfo.mimeType.startsWith('video/');
  const isAudio = fileInfo.mimeType && fileInfo.mimeType.startsWith('audio/');

  const renderPreviewContent = () => {
    if (isImage) {
      return (
        <div style={{ textAlign: 'center' }}>
          <Image
            src={fileInfo.fileUrl}
            alt={fileInfo.originalName}
            style={{ maxWidth: '100%', maxHeight: '600px' }}
          />
        </div>
      );
    }

    if (isPdf) {
      return (
        <iframe
          src={fileInfo.fileUrl}
          style={{ width: '100%', height: '600px', border: 'none' }}
          title={fileInfo.originalName}
        />
      );
    }

    if (isVideo) {
      return (
        <video
          controls
          style={{ width: '100%', maxHeight: '600px' }}
          src={fileInfo.fileUrl}
        >
          您的浏览器不支持视频播放
        </video>
      );
    }

    if (isAudio) {
      return (
        <audio
          controls
          style={{ width: '100%' }}
          src={fileInfo.fileUrl}
        >
          您的浏览器不支持音频播放
        </audio>
      );
    }

    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <FileOutlined style={{ fontSize: '64px', color: '#ccc' }} />
        <div style={{ marginTop: '16px' }}>
          该文件类型不支持在线预览
        </div>
        <Button 
          type="primary" 
          icon={<DownloadOutlined />}
          style={{ marginTop: '16px' }}
          onClick={() => fileApi.downloadFile(fileInfo.id, fileInfo.originalName)}
        >
          下载文件
        </Button>
      </div>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <FileOutlined />
          {fileInfo.originalName}
        </Space>
      }
      visible={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="download" icon={<DownloadOutlined />} onClick={() => fileApi.downloadFile(fileInfo.id, fileInfo.originalName)}>
          下载
        </Button>,
        <Button key="close" onClick={onClose}>
          关闭
        </Button>
      ]}
    >
      {renderPreviewContent()}
      
      <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Text type="secondary">文件大小：</Text>
            <Text>{formatFileSize(fileInfo.fileSize)}</Text>
          </Col>
          <Col span={8}>
            <Text type="secondary">文件类型：</Text>
            <Text>{fileInfo.mimeType}</Text>
          </Col>
          <Col span={8}>
            <Text type="secondary">上传时间：</Text>
            <Text>{new Date(fileInfo.createdAt).toLocaleString()}</Text>
          </Col>
        </Row>
        {fileInfo.downloadCount > 0 && (
          <Row style={{ marginTop: '8px' }}>
            <Col span={8}>
              <Text type="secondary">下载次数：</Text>
              <Text>{fileInfo.downloadCount}</Text>
            </Col>
          </Row>
        )}
      </div>
    </Modal>
  );
};

// ===============================================
// 5. 文件管理页面
// ===============================================

/**
 * 文件管理页面
 */
const FileManagePage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const { hasPermission } = usePermission();

  const tabItems = [
    { key: 'all', label: '全部文件', fileType: '' },
    { key: 'image', label: '图片文件', fileType: 'image' },
    { key: 'document', label: '文档文件', fileType: 'document' },
    { key: 'avatar', label: '头像文件', fileType: 'avatar' }
  ];

  const handleFileSelect = (file) => {
    setPreviewFile(file);
    setPreviewVisible(true);
  };

  const handleUploadSuccess = () => {
    setUploadModalVisible(false);
    message.success('文件上传成功');
    // 刷新文件列表
    window.location.reload();
  };

  return (
    <div className="file-manage-page">
      <Card
        title="文件管理"
        extra={
          hasPermission('files:upload') && (
            <Button 
              type="primary" 
              icon={<UploadOutlined />}
              onClick={() => setUploadModalVisible(true)}
            >
              上传文件
            </Button>
          )
        }
      >
        <div style={{ marginBottom: '16px' }}>
          <Space>
            {tabItems.map(item => (
              <Button
                key={item.key}
                type={activeTab === item.key ? 'primary' : 'default'}
                onClick={() => setActiveTab(item.key)}
              >
                {item.label}
              </Button>
            ))}
          </Space>
        </div>

        <FileListComponent
          fileType={tabItems.find(item => item.key === activeTab)?.fileType}
          onFileSelect={handleFileSelect}
        />
      </Card>

      {/* 上传文件弹窗 */}
      <Modal
        title="上传文件"
        visible={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={600}
      >
        <FileUploadComponent
          maxCount={5}
          onSuccess={handleUploadSuccess}
        />
      </Modal>

      {/* 文件预览弹窗 */}
      <FilePreviewComponent
        fileInfo={previewFile}
        visible={previewVisible}
        onClose={() => {
          setPreviewVisible(false);
          setPreviewFile(null);
        }}
      />
    </div>
  );
};

// ===============================================
// 6. 工具函数
// ===============================================

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * 检查文件名是否安全
 */
const isSafeFileName = (fileName) => {
  if (!fileName || fileName.trim() === '') return false;
  
  const dangerousPatterns = ['../', '..\\', '<', '>', '|', ':', '*', '?', '"', 'script'];
  const lowerFileName = fileName.toLowerCase();
  
  for (const pattern of dangerousPatterns) {
    if (lowerFileName.includes(pattern)) {
      return false;
    }
  }
  
  return fileName.length <= 255;
};

/**
 * 图片转Base64
 */
const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// ===============================================
// 7. API接口封装
// ===============================================

/**
 * 文件管理API
 */
export const fileApi = {
  // 上传文件
  upload: async (formData) => {
    const response = await fetch('/api/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    return response.json();
  },

  // 获取文件列表
  getFileList: async (params) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`/api/files?${query}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  },

  // 获取文件信息
  getFileInfo: async (id) => {
    const response = await fetch(`/api/files/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  },

  // 下载文件
  downloadFile: async (id, fileName) => {
    const response = await fetch(`/api/files/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } else {
      throw new Error('下载失败');
    }
  },

  // 删除文件
  deleteFile: async (id) => {
    const response = await fetch(`/api/files/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  },

  // 批量删除文件
  batchDeleteFiles: async (ids) => {
    const response = await fetch('/api/files/batch', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(ids)
    });
    return response.json();
  }
};

// ===============================================
// 8. 导出组件
// ===============================================

export {
  FileUploadComponent,
  AvatarUpload,
  FileListComponent,
  FilePreviewComponent,
  FileManagePage,
  formatFileSize,
  isSafeFileName,
  getBase64
};

export default {
  FileUploadComponent,
  AvatarUpload,
  FileListComponent,
  FilePreviewComponent,
  FileManagePage,
  fileApi
};
