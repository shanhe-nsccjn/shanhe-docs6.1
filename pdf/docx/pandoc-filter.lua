local is_first_header = true
local is_first_copyright = true
local is_first_front = true
local image_index = 0
local table_index = 0
local TYPE_TITLE = {"说明", "警告", "注意", "危险"}
local EXCLUDE_IMAGE_FILE_LIST = {"/kafka_input_topic_name.png$", "/kafka_output_topic_name.png$"}

function getNoteTitle(li_type, r_type_title)
  local r_li_type = "1"
  local r_type = ""
  if li_type == 'bullet' then
    r_li_type = "1"
  else
    r_li_type = "0"
  end
  if r_type_title == "说明" then
    r_type = "Notetitle"
  elseif r_type_title == "警告" then
    r_type = "Warningtitle"
  elseif r_type_title == "注意" then
    r_type = "Attentiontitle"
  else
    r_type = "Dangertitle"
  end
  local RAW_CONTENT = [[
    <w:p>
        <w:pPr>
            <w:numPr>
                <w:ilvl w:val="{{li_type}}" />
                <w:numId w:val="1000" />
            </w:numPr>
            <w:pStyle w:val="{{type}}" />
        </w:pPr>
        <w:r>
            <w:t xml:space="preserve">{{type_title}}</w:t>
        </w:r>
    </w:p>
  ]]
  return string.gsub(string.gsub(string.gsub(RAW_CONTENT, "{{li_type}}", r_li_type), "{{type}}", r_type), "{{type_title}}", r_type_title)
end
function dealParaImage(elem, width)
  if (width == nil) then
    width = "370pt"
  end
  if (elem.tag == "Para") then
    for i, v in ipairs(elem.content) do
      if (v.tag == "Image") then
        local flag = true
        for i, value in ipairs(EXCLUDE_IMAGE_FILE_LIST) do
          if (string.find(v.src, value)) then
            flag = false
            break
          end
        end
        if flag and v.attr.attributes.width ~= "nil" then
          v.attr.attributes.width = width
        end
      end
    end
  end
end

function dealListImage(elem, width)
  if (elem.tag == "BulletList" or elem.tag == "OrderedList") then
    for i1, v1 in ipairs(elem.content) do
      for i2, v2 in ipairs(v1) do
        dealParaImage(elem.content[i1][i2], width)
      end
    end
  end
end

function dealListImageWidth(elem)
  for i1, v1 in ipairs(elem) do
    if (v1.tag == "Div") then
      for i2, v2 in pairs(v1.content) do
        dealParaImage(v2)
        dealListImage(v2)
      end
    end
    dealParaImage(v1)
    dealListImage(v1)
  end
end

function orderedListFunc(elem, r_type_title)
  for i1, v1 in ipairs(elem.content) do
    dealListImageWidth(v1)
    if (string.find(pandoc.utils.stringify(v1), r_type_title)) then
      local noteIndex = -1
      for i2, v2 in ipairs(v1) do
        if (pandoc.utils.stringify(v2) == r_type_title) then
          noteIndex = i2
          elem.content[i1][i2] = pandoc.RawBlock("openxml", getNoteTitle("ordered", r_type_title))
        end
        if (i2 == (noteIndex + 1)) then
          if (#v2.content > 0) then
            content_type = pandoc.utils.type(v2.content[1].content)
            if content_type == "List" then
              elem.content[i1][noteIndex] = pandoc.RawBlock("openxml", getNoteTitle("bullet", r_type_title))
            end
          end
        end
      end
    end
  end
end

function bulletListFunc(elem, r_type_title)
  for i1, v1 in ipairs(elem.content) do
    dealListImageWidth(v1)
    if (string.find(pandoc.utils.stringify(v1), r_type_title)) then
      local noteIndex = -1
      for i2, v2 in ipairs(v1) do
        if (pandoc.utils.stringify(v2) == r_type_title) then
          noteIndex = i2
          elem.content[i1][i2] = pandoc.RawBlock("openxml", getNoteTitle("bullet", r_type_title))
        end
      end
    end
  end
end

local RAW_TOC = [[
  <w:sdt>
      <w:sdtContent xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:p>
              <w:r>
                  <w:fldChar w:fldCharType="begin" w:dirty="true" />
                  <w:instrText xml:space="preserve">TOC \o "1-3" \h \z \u</w:instrText>
                  <w:fldChar w:fldCharType="separate" />
                  <w:fldChar w:fldCharType="end" />
              </w:r>
          </w:p>
      </w:sdtContent>
  </w:sdt>
]]
local RAW_PAGEBREAK = "<w:p><w:r><w:br w:type=\"page\" /></w:r></w:p>"
return {
  {
    OrderedList = function (elem)
      for _, v in ipairs(TYPE_TITLE) do
        orderedListFunc(elem, v)
      end
      return elem
    end,
    BulletList = function (elem)
      for _, v in ipairs(TYPE_TITLE) do
        bulletListFunc(elem, v)
      end
      return elem
    end,
    Image = function(elem)
      if image_index <= 2 then
        image_index = image_index + 1
        if image_index == 1 then
          elem.attr.attributes.width = "150pt"
          local image_content_1 = elem
          image_content_1["attr"]["attributes"]["custom-style"] = "Logo image"
          return pandoc.Inlines({
            pandoc.Str("                                                                                               "),
            elem,
          })
        elseif image_index == 2 then
          local image_content_2 = elem
          image_content_2["attr"]["attributes"]["custom-style"] = "Cover image"
          return {
            pandoc.LineBreak(),
            pandoc.Str("                                "),
            elem,
          }
        end
      end
      return elem
    end,
    Para = function (elem)
      if (pandoc.utils.stringify(elem) == "【版权声明】") then
        if (is_first_copyright) then
          local first_copyright_text = pandoc.Div(elem)
          first_copyright_text["attr"]["attributes"]["custom-style"] = "Body Text"
          is_first_copyright = false
          return {
            pandoc.RawBlock("openxml", RAW_PAGEBREAK),
            first_copyright_text,
          }
        end
      end
      if (pandoc.utils.stringify(elem) == "前言") then
        if (is_first_front) then
          local front_text = pandoc.Div("前言")
          front_text["attr"]["attributes"]["custom-style"] = "Front doc title"
          is_first_front = false
          return {
            pandoc.RawBlock("openxml", RAW_PAGEBREAK),
            front_text,
          }
        end
      end
      return elem
    end,
    Header = function (elem)
      if is_first_header then
        local toc_title = pandoc.Div("目录")
        toc_title["attr"]["attributes"]["custom-style"] = "TOC title"
        is_first_header = false
        return {
          pandoc.RawBlock("openxml", RAW_PAGEBREAK),
          toc_title,
          pandoc.RawBlock("openxml", RAW_TOC),
          pandoc.RawBlock("openxml", RAW_PAGEBREAK),
          elem,
        }
      end
      return elem
    end,
    Table = function (elem)
      local flag = 0
      if (#elem.head.rows == 1 and #elem.head.rows[1].cells == 1) then
        local header_content = elem.head.rows[1].cells[1].contents
        local title = pandoc.utils.stringify(header_content)
        if title == "说明" then
          flag = 1
        elseif title == "警告" then
          flag = 2
        elseif title == "注意" then
          flag = 3
        elseif title == "危险" then
          flag = 4
        end
      end
      if table_index <= 2 then
        table_index = table_index + 1
        if table_index == 1 then
          local table_content_1 = pandoc.Div(elem.bodies[1].body[1].cells[1].contents)
          table_content_1["attr"]["attributes"]["custom-style"] = "Conver title"
          return {
            pandoc.LineBreak(),
            table_content_1,
            pandoc.LineBreak(),
          }
        elseif table_index == 2 then
          local table_content_2 = pandoc.Div(elem.bodies[1].body[1].cells[1].contents)
          table_content_2["attr"]["attributes"]["custom-style"] = "Cover info"
          return table_content_2
        end
      end

      if (flag == 0) then
        return elem
      end

      local custom_title_style = ""
      local custom_content_style = ""
      if (flag == 1) then
        custom_title_style = "Note title"
        custom_content_style = "Note content"
      elseif (flag == 2) then
        custom_title_style = "Warning title"
        custom_content_style = "Warning content"
      elseif (flag == 3) then
        custom_title_style = "Attention title"
        custom_content_style = "Attention content"
      else
        custom_title_style = "Danger title"
        custom_content_style = "Danger content"
      end

      local result_title = elem.head.rows[1].cells[1].contents
      title_div = pandoc.Div(result_title)
      title_div["attr"]["attributes"]["custom-style"] = custom_title_style

      local result_content = elem.bodies[1].body[1].cells[1].contents
      content_div = pandoc.Div(result_content)
      content_div["attr"]["attributes"]["custom-style"] = custom_content_style

      return {
        title_div,
        content_div,
      }
    end,
  }
}