# 飞书文档 API 实战笔记

## Block Type 实测对照（2026-05-04）

文档里写的和实际能用的不一样，以下是实测结果：

| 用途 | block_type | key | 备注 |
|:--|:--|:--|:--|
| 普通文本 | 2 | `text` | ✅ |
| 一级标题 | 3 | `heading1` | 未测 |
| 二级标题 | 4 | `heading2` | ✅ |
| 三级标题 | 5 | `heading3` | ✅ |
| 无序列表 | **12** | `bullet` | ⚠️ 不是 7 |
| 有序列表 | 待测 | `ordered` | |
| 分割线 | **22** | `divider` | ⚠️ 不是 14 |

## 关键要求

1. **所有 text 类 block 必须带 `"style": {}`**，否则 400 invalid param
2. 批量创建最多 **50 个 block/次**，超过要分批
3. `index: -1` 表示追加到末尾，`index: 0` 插入到开头
4. 批量删除：`DELETE /docx/v1/documents/{doc_id}/blocks/{page_id}/children/batch_delete`
   - 需要传 `block_ids` + `start_index` + `end_index`
5. 创建文档后要手动授权：`POST /drive/v1/permissions/{doc_token}/members?type=docx`
   - 传 `owner_open_id` 可以在创建时直接授权

## Token 获取

```
POST https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal
Body: {"app_id": "...", "app_secret": "..."}
```

有效期约 2 小时。
